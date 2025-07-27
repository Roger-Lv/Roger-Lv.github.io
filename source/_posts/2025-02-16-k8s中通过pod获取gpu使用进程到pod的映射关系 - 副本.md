---
title: k8s中通过pod获取gpu使用进程到pod的映射关系
date: 2025-02-16
updated:
tags: [NVIDIA,GPU,k8s,pod,nvml]
categories: k8s
keywords:
description:
top_img: /img/default_top_img.jpg
comments:
cover: /img/cover/CUDA.png
toc:
toc_number:
toc_style_simple:
copyright:
copyright_author:
copyright_author_href:
copyright_url:
copyright_info:
mathjax:
katex:
aplayer:
highlight_shrink:
aside:
abcjs:




---

#  k8s中通过pod获取gpu使用进程到pod的映射关系

## 背景

该任务的pod为daemonset在集群的每一个节点上，controller pod（只有一个）通过grpc的方式进行调用该daemonset pod获取到该节点上gpu的使用进程到pod的映射关系，传递的参数为使用gpu的pod的id。

该需求涉及到几个部分内容：

1. 如何通过pod id定位到具体的节点
   1. 通过controller 的cache机制（包含有pod和node cache）获取到daemonset pod id对应的node ip，在daemonset的pod部分新建grpc server端，根据ip:port构建grpc client即可
2. 如何获取到节点上的gpu->process的映射关系
   1. 调用go-nvml即可
3. 如何获取到节点上的process->container的映射关系
   1. 调用taskClient
4. container->pod的映射关系？
   1. controller cache机制获取到对应的node，然后可以获取到该node上的pod和container，做一层映射，随着请求发送给daemonset pod即可，daemonset pod进行调用

## 解决

节点上调用nvml正确获取宿主机上的gpu和pid信息

1. 涉及到两个目标

   1. 正确的将gpu挂载进去 且 不需要对gpu资源的具体请求：

      daemonset.yaml做如下修改：

      ```yaml
      hostPID: true
      env:
      ...
      - name: NVIDIA_DRIVER_CAPABILITIES
        value: all
      - name: NVIDIA_VISIBLE_DEVICES
        value: all 
       
      ```

      这部分的原理就是nvidia-container-toolkit 会根据该 Env 拿到要分配给该容器的 GPU 及相关驱动的能力，最终把相关文件挂载到容器里，此时能够正确使用nvml的功能。参考：https://blog.csdn.net/java_1996/article/details/144586459?fromshare=blogdetail&sharetype=blogdetail&sharerId=144586459&sharerefer=PC&sharesource=a1150568956&sharefrom=from_link

   2. pid信息要与宿主机一致：

      具体的修改在daemonset.yaml中:

      ```YAML
      hostPID: true
      ```

daemonset pod部分代码：

```go
func (s *Server) GetGpuPidPods(req *v1alpha1.GetGpuPodsRequest) (map[string]*v1alpha1.Pods, map[string]*v1alpha1.GpuInfo, error) {
        if ret := nvml.Init(); ret.String() == "ERROR_LIBRARY_NOT_FOUND" {
                s.logger.Errorf("return error: %s \n", ret.String())
                return nil, nil, fmt.Errorf(ret.String())
        }
        defer nvml.Shutdown()
        containerIdPidMap := make(map[string][]int)
        pidContainerIdMap := make(map[int]string)
        // response
        GpuPods := make(map[string]*v1alpha1.Pods)
        GpuInfos := make(map[string]*v1alpha1.GpuInfo)
        // list tasks
        ctx := namespaces.WithNamespace(context.Background(), s.ContainerdNamespace)
        tasks, err := s.taskClient.List(ctx, &tasksapi.ListTasksRequest{
                Filter: "status==running",
        })
        if err != nil {
                return nil, nil, err
        }
        s.logger.Infof("task=container num:%d", len(tasks.Tasks))
        for _, process := range tasks.Tasks {
                var pids []int
                s.logger.Infof("pid:%d,containerID:%s,ID:%s", process.Pid, process.GetContainerID(), process.GetID())
                // List pids in container
                containerProcesses, err := s.taskClient.ListPids(ctx, &tasksapi.ListPidsRequest{
                        ContainerID: process.GetID(),
                })
                if err != nil {
                        continue
                }
                for _, p := range containerProcesses.Processes {
                        pids = append(pids, int(p.Pid))
                        pidContainerIdMap[int(p.Pid)] = process.GetID()
                        s.logger.Infof("pid:%d, containerID:%s", p.Pid, process.GetID())
                }
                containerIdPidMap[process.GetID()] = pids
        }
        // get GPU Num
        gpuNum, ret := nvml.DeviceGetCount()
        s.logger.Infof("get count ret : %s", ret.String())
        if ret != nvml.SUCCESS {
                s.logger.Errorf("Failed to get GPU count: %s", ret.String())
                return nil, nil, fmt.Errorf(ret.String())
        }
        fmt.Printf("gpu num:%d\n", gpuNum)
        // get containerpid->podname
        containerPods, err := s.getContainerPodsFromController(req.WorkerId)
        if err != nil {
                return nil, nil, err
        }
        for i := 0; i < gpuNum; i++ {
                device, ret := nvml.DeviceGetHandleByIndex(i)
                s.logger.Infof("getbyindex: %s", ret.String())
                if ret != nvml.SUCCESS {
                        continue // Skip to the next device if there's an error
                }
                uuid, ret := device.GetUUID()
                if ret != nvml.SUCCESS {
                        continue // Skip to the next device if there's an error
                }
                s.logger.Infof("get UUID: %s", uuid)
                process, ret := device.GetComputeRunningProcesses()
                if ret != nvml.SUCCESS {
                        continue // Skip to the next device if there's an error
                }
                name, ret := device.GetName()
                if ret != nvml.SUCCESS {
                        continue // Skip to the next device if there's an error
                }
                usage, ret := device.GetUtilizationRates()
                if ret != nvml.SUCCESS {
                        continue // Skip to the next device if there's an error
                }
                // response: gpu->gpuinfo
                gpuInfo := v1alpha1.GpuInfo{
                        GpuName:  name,
                        Uuid:     uuid,
                        UsageGpu: usage.Gpu,
                }
                GpuInfos[uuid] = &gpuInfo
                for _, p := range process {
                        pidName, _ := nvml.SystemGetProcessName(int(p.Pid))
                        s.logger.Infof("Process ID: %d, Process name: %s, UUID: %s, Name: %s, GPUusage:%v MiB, GPUInstanceID:%v. ", p.Pid, pidName, uuid, name, p.UsedGpuMemory/(1024*1024), p.GpuInstanceId)
                        if containerID, exist := pidContainerIdMap[int(p.Pid)]; exist {
                                s.logger.Infof("pid: %v,containerID: %v", p.Pid, containerID)
                                if podName, exist := containerPods[containerID]; exist {
                                        //              |->pod
                                        // response: gpu-->pod
                                        //              |->pod
                                        s.logger.Infof("containerID: %v，podName:%v", containerID, podName)
                                        gpuPods := v1alpha1.PidPods{
                                                Pid:           p.Pid,
                                                ProcessName:   pidName,
                                                UsedGpuMemory: p.UsedGpuMemory / (1024 * 1024), //MiB
                                                Pod:           podName,
                                        }
                                        if _, exists := GpuPods[uuid]; !exists {
                                                var pidpod v1alpha1.Pods
                                                GpuPods[uuid] = &pidpod
                                        }
                                        GpuPods[uuid].PidPods = append(GpuPods[uuid].PidPods, &gpuPods)
                                }
                        }
                }
        }
        return GpuPods, GpuInfos, nil
}
func (s *Server) GetGpuPods(ctx context.Context, req *v1alpha1.GetGpuPodsRequest) (*v1alpha1.GetGpuPodsResponse, error) {
        GpuPods, GpuInfos, err := s.GetGpuPidPods(req)
        if err != nil {
                return nil, err
        }
        return &v1alpha1.GetGpuPodsResponse{
                GpuPods:  GpuPods,
                GpuInfos: GpuInfos,
        }, nil
}
func (s *Server) getContainerPodsFromController(containerIDPodName string) (map[string]string, error) {
        // 创建一个空的map来存储解析后的数据
        containerPods := make(map[string]string)
        // 使用json.Unmarshal将JSON字符串解析到map中
        err := json.Unmarshal([]byte(containerIDPodName), &containerPods)
        if err != nil {
                return nil, fmt.Errorf("failed to unmarshal JSON: %w", err)
        }
        return containerPods, nil
}
type PidContainerID struct {
        Pid         int
        ContainerID string
}
```

proto相关代码

```go

service Server {
   ...
    // gpu->pid->pod
    rpc GetGpuPods(GetGpuPodsRequest)returns(GetGpuPodsResponse){
        option (google.api.http) = {
            get: "/gpu-pods"
        };
    }
}
message GetGpuPodsRequest {
    string worker_id = 1;
}

message GetGpuPodsResponse {
    map<string,Pods>GpuPods =1;
    map<string,GpuInfo>GpuInfos =2;
}

message Pods{
    repeated PidPods pidPods =1;
}

message PidPods{
    uint32 pid = 1;
    string processName = 2;
    uint64 UsedGpuMemory = 3;
    string pod = 4;
}

message GpuInfo{
    // gpu->gpuInfo
    string uuid = 1;
    string gpuName = 2;
    uint32 usageGpu =3;
}
```

controller相关代码

```go
func (s *Controller) GetGpuPods(ctx context.Context, req *v1alpha1.GetGpuPodsRequest) (*v1alpha1.GetGpuPodsResponse, error) {
        // from workerId get 
        // podName->nodeName->Client
        podName := req.WorkerId
        nodeName, err := s.getNodeName(podName)
        if err != nil {
                return nil, err
        }
        // nodeName-> client
        if Client, exist := s.cache.NodeConn[nodeName]; !exist {
                var Target string
                // ip:port
                ip, err := s.getNodeIP(podName)
                if err != nil {
                        return nil, err
                }
                port := config.DefaultConfig().Port
                Target = ip + ":" + port
                Conn, err := grpc.NewClient(Target, grpc.WithTransportCredentials(insecure.NewCredentials()))
                if err != nil {
                        return nil, err
                }
                Client = v1alpha1.NewClient(Conn)
                s.cache.NodeConn[nodeName] = Client
        }
        // send request
        // get container->pod info
        containerPods := s.getContainerPodsByNodeName(nodeName)
        jsonData, err := json.Marshal(containerPods)
        if err != nil {
                fmt.Println("Error marshaling map:", err)
                return nil, err
        }
        containerPodMap := string(jsonData)
        s.logger.Infof("marshall workerid: %v", containerPodMap)
        ssReq := &v1alpha1.GetGpuPodsRequest{
                // containerId->podName
                WorkerId: containerPodMap,
        }
        res, err := s.cache.NodeConn[nodeName].GetGpuPods(ctx, ssReq)
        if err != nil {
                delete(s.cache.NodeConn, nodeName)
                return nil, err
        }
        return res, nil
}

func (s *Controller) getContainerPods() map[string]string {
        containerPods := make(map[string]string)
        for _, pi := range s.cache.Snapshot().Pods {
                for _, c := range pi.Pod.Status.ContainerStatuses {
                        containerPods[c.ContainerID] = pi.Pod.GetName()
                }
        }
        return containerPods
}

func (s *Controller) getContainerPodsByNodeName(nodeName string) map[string]string {
        containerPods := make(map[string]string)
        for _, pi := range s.cache.Snapshot().Pods {
                if pi.Pod.Spec.NodeName != nodeName {
                        continue
                }
                for _, c := range pi.Pod.Status.ContainerStatuses {
                        containerId := strings.TrimPrefix(c.ContainerID, "containerd://")
                        containerPods[containerId] = pi.Pod.GetName()
                }
        }
        return containerPods
}

func (s *Controller) getNodeName(podName string) (string, error) {
        s.logger.Infof("start getting node name by pod name: %s, num of pods:%d", podName, len(s.cache.Snapshot().Pods))
        for _, pi := range s.cache.Snapshot().Pods {
                s.logger.Infof("wanted:%s, getted:%s", podName, pi.Name)
                if pi.Name == podName {
                        if len(pi.Pod.Spec.NodeName) > 0 {
                                s.logger.Infof("get node name by pod name: %s, nodeName: %s", podName, pi.Pod.Spec.NodeName)
                                return pi.Pod.Spec.NodeName, nil
                        } else {
                                return "", fmt.Errorf("this pod is not on a specific node")
                        }
                }
        }
        return "", fmt.Errorf("no match pod name")
}
func (s *Controller) getNodeIP(podName string) (string, error) {
        s.logger.Infof("start getting node ip by pod name: %s, num of pods:%d", podName, len(s.cache.Snapshot().Pods))
        for _, pi := range s.cache.Snapshot().Pods {
                if pi.Name == podName {
                        ni := s.cache.GetNodeInfo(pi.Pod.Spec.NodeName)
                        if ni == nil {
                                return "", fmt.Errorf("node info not found for pod %s", podName)
                        }
                        for _, addr := range ni.Node.Status.Addresses {
                                s.logger.Infof("podName: %s, addType: %s, addAddress: %s", podName, addr.Type, addr.Address)
                                if addr.Type == v1.NodeInternalIP {
                                        s.logger.Infof("find address:%s", addr.Address)
                                        return addr.Address, nil
                                }
                        }
                        return "", fmt.Errorf("no internal IP found for node %s", pi.Pod.Spec.NodeName)
                }
        }
        return "", fmt.Errorf("no match pod name: %s", podName)
}
```

## 效果

![gpu.png](https://s2.loli.net/2025/02/16/jAEbzcMgK1hlwUv.png)

## 其他猜的坑

在裸机上，go-nvml能正常运行；但在进行镜像的制作时，报错：

![gonvml.png](https://s2.loli.net/2025/02/16/vwxaul9tSWXIphT.png)

用mindprince-gonvml替代go-nvml：https://github.com/mindprince/gonvml

但这个库能获取到的信息非常有限，拿不到进程相关的信息，无法满足需求。

参考解决方案：

https://github.com/NVIDIA/go-nvml/issues/49

https://github.com/NVIDIA/go-nvml/issues/8

其需要cgo，故令CGO_ENABLED=1后，遇到该问题

![cgo.png](https://s2.loli.net/2025/02/16/3BafzycqgReX68m.png)

github上有人遇到了相同的问题：

![githubcgo.png](https://s2.loli.net/2025/02/16/9QMp3EnzRACPKIJ.png)

解决方案：

https://blog.csdn.net/sun007700/article/details/120487881?fromshare=blogdetail&sharetype=blogdetail&sharerId=120487881&sharerefer=PC&sharesource=a1150568956&sharefrom=from_link

https://www.jianshu.com/p/e0ad27fe4e2d

```Shell
sudo apt-get update
sudo apt-get install gcc-aarch64-linux-gnu g++-aarch64-linux-gnu
```

.mak

![.png](https://s2.loli.net/2025/02/16/4h8zg5yLKqFbUjR.png)

后续能正常编译

另外Base镜像要用Ubuntu