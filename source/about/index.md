---
title: About
date: 2024-06-24 14:33:44
type: "about"
comments: false
---

## 1. Brief Introduction

- **AI Infra&Backend Development&Distributed System&System Software**
- **Java&Python&Golang&C++**
- **Infinigence-AI&CETC&PKU CS&Momenta Intern**

## 2. Education Experience

- **Peking University (2024.09- 2027.06)**

  ![peking_university_logo[1].jpg](https://s2.loli.net/2024/09/28/Wt8RuqCek7Y6hjN.jpg)

  - **M.D.，System Software**

- **University of Electronic Science and Technology of China (2020.09-2024.06)**

  ![UESTC.png](https://s2.loli.net/2025/06/25/r9unZOxsM7beadK.png)

  - **B.Eng.，Software Engineering**
  - **Rank:3/181 GPA:3.99/4.00**

- **Chongqing Nankai Secondary School (2017.09-2020.07)**

  ![CQNK.png](https://s2.loli.net/2025/06/25/tDC3lozryuU42Gj.png)

## 3. Work Experience

- **Canlah.ai（2025.06-）**

  ![canlah.jpeg](https://s2.loli.net/2025/08/20/DzsFBCgcn6N1SKw.jpg)

  **Silicon Valley (Remote)**

  **Intern**

  - Agent.

- **Peking University Changsha Institute of Computing and Digital Economy（2025.04-2025.07）**

  ![pkucs.jpeg](https://s2.loli.net/2025/08/20/Uun4MfXB2Cr5ySp.jpg)

  **Beijing**

  **Intern**

  - Computing power scheduling, containerization research, container networks.

- **Infinigence-AI（2024.09-）**

  ![无问芯穹.png](https://s2.loli.net/2024/09/20/eT1fOs54oDlIPUW.jpg)

  **Beijing**

  **Intern**

  - AI Infra.

- **CETC（2024.06-2024.08）**

  ![CEC.jpg](https://s2.loli.net/2025/06/25/lkZQDbu9jBAFdMP.jpg)

  **Beijing**

  **Research Intern**

  - LLM research.

- **Peking University (2023.08-2024.05)**

  ![peking_university_logo[1].jpg](https://s2.loli.net/2024/09/28/Wt8RuqCek7Y6hjN.jpg)

  **Beijing**

  **Research Intern**

  - High performance middleware, operating system, distributed system.
  - In the context of heterogeneous digital space and digital networking, the software and hardware development (Java language and Netty framework/cryptographic signature acceleration card) is used to realize the digital networking switch for heterogeneous data space in order to achieve the purpose of the interaction between digital networking infrastructure (digital networking positioning system, etc.) and IDS and other types of digital space, the north-south interfaces of digital networking, and the clients, so that the digital space, the warehouses, and the clients All access to the digital network, the multi-party digital space and digital networking and digital networking infrastructure to combine, to achieve high performance, high availability, high stability, cross-space, high compatibility of data sending and receiving, data positioning and access, and through the node to complete the update level of the digital networking reference realization using the data in the data language use of the data associated with the relevant information.

- **Momenta (2023.02-2023.08)**

  ![momenta.png](https://s2.loli.net/2025/06/25/oa7pL1B4e9iuVIs.png)

  **Beijing**

  **Development Intern**

  - High precision map storage system.
  - Participate in the development process of map spatio-temporal data management system based on multi-version control, Java Springboot framework and juiceFS file system, use Swagger to build visual API documents, build continuous integration and automated test platform based on jenkins.
  - For the map data bias business requirements, I help the downstream departments to create dynamic link libraries, use JNI to enable Java to interact with them, and design relevant interfaces to decouple the business logic so that the storage and bias operations can be separated to realize the business requirements.
  - In order to let the outsourcing business department use the system, I use logback and slf4j framework to realize log record storage, and use Spring Cloud Gateway for routing and forwarding to achieve the purpose of permission restriction, and packaged docker image.
    -Write python scripts and set up timed statistical map system data under Linux system, automate data import into PostgreSQL and use dataease to configure pg data source to achieve data visualization.
  - For map adjacency judgment (changed from rule engine to data-driven), designed to extract osm map feature data, designed neural network structure for binary classification of map adjacency, with accuracy, recall and F1 Score close to 0.95 on both training and test sets.

## 4. Awards

- **2024 Outstanding University Graduates of Sichuan Province**
- **2022 National Scholarship**
- **2023 National Scholarship**
- **2021 First class scholarship of UESTC**
- **2022 First class scholarship of UESTC**
- **2023 First class scholarship of UESTC**
- **2022 Third Prize of National Finals of C4-Network Technology Challenge**
- **2022 Third Prize in Southwest Region of C4-Network Technology Challenge**
- **2022 The Honorable Mention of MCM**

## 5. Projects

### **Design and Implementation of a Digital Networking Switch for Heterogeneous Data SpaceDesign and Implementation of a Digital Networking Switch for Heterogeneous Data Space**

**2023.10 - 2024.05**

**related organization: Peking Unversity**

https://edu.gitee.com/pkudataspace/repos/pkudataspace/iod-switch

![data-switch (2).png](https://s2.loli.net/2024/06/24/OkHeSntc8BjJZuf.png)

![DOA.png](https://s2.loli.net/2024/06/24/mesBFrjKNuJop7q.jpg)

- Digital networking is a technical solution to interconnect heterogeneous data spaces using standardized and protocolized ideas. Through the digital networking gateway, the heterogeneity of different data spaces is shielded; through the digital networking switch, the DOIP message forwarding across data spaces is realized; through the digital networking router to manage the correspondence between the identifiers in the heterogeneous space and the digital networking switch.
- This project is mainly based on the Java language using Netty framework to implement the heterogeneous data space-oriented digital networking switch, through the use of DOIP-SDK, IRP-SDK, Caffiene high-performance cache components, optimization of caching, optimization of connection pooling based on FixedChannelPool, based on the development of JCE interfaces to use the Sansec encryption card and other designs. Implemented a digital networking switch, through Grafana and built-in Prometheus on the digital networking switch statistics, through the relevant Controller class and Javascript interface call code and its deploy method deployed in a number of cloud servers, can be directly through the DOBrowser switch related to the interface call. In terms of functionality, the Digital Networking Switch can correctly interact with other Digital Networking Switches or Digital Networking Gateways to complete the correct parsing of DOIP protocol requests and the correct forwarding of packets for packet switching; in terms of performance optimization, it optimizes the client connection, caching and other aspects. Meanwhile, this thesis innovatively constructs a cache load test set based on Pareto distribution and conducts targeted tests on performance optimization aspects, and the experimental results show that the Digital Networking Switch achieves high-performance, high-availability, high-stability, cross-space, and high-compatibility data sending and receiving, data positioning, and acquisition.

### Children's Home Intelligent Safety Detection System

**2021.09 - 2023.01**

**related organization: University of Electronic Science and Technology of China** 

![Children_protection_system.png](https://s2.loli.net/2024/06/24/SiTHRQ1Uh9M85k6.jpg)

- Use python language crawler to crawl the dataset and write code for data enhancement to expand the dataset, use labelImg to label the dataset, and train the model on the crawled dataset based on pytorch, the open source project YOLOv5 and OpenPose. Self-modify the YOLO source code and write the rule engine to realize the determination of children's dangerous actions and dangerous coefficients, realize real-time warning, modify the loss function and fuse the two models to improve the detection accuracy.
- Write test cases and test plans, use pytest framework for interface testing, and write related documents. The project was selected as the outstanding student work of the class of 2020 in the School of Information and Software Engineering of the University of Electronic Science and Technology for exhibition, and was shortlisted for the national competition of the Challenge Cup and Computer Design Competition, and won the third prize of the finals.

### Monitora-Intelligent Network Inspection System Based on P4 and SRv6

**2022.04-2022.09**

**related organization: University of Electronic Science and Technology of China**

![Monitora5.png](https://s2.loli.net/2024/06/24/PhsSKdfe8VxYUJb.png)

![Monitora2.png](https://s2.loli.net/2024/06/24/XtaKWgI5jChTf6r.png)

![Monitora.png](https://s2.loli.net/2024/06/24/OdE3GHY78FpuhtL.png)

- In this project, a P4-based network monitoring system is designed to realize real-time and efficient monitoring of the network. Through the P4-based active telemetry system, the appropriate number and special format of probe data packets are used to replace the normal data packets for network telemetry, which reduces the telemetry overhead and improves the payload ratio of the data packets. Efficient real-time network telemetry is realized.
- Based on the simple and flexible routing control capability of segment routing (SR, segment routing) to dynamically specify the probe path by changing the SR label and its ordering at runtime. We can add SR label stacks to the probes to support getting a comprehensive view of the network. Also, by using a ring probe path, a single probe point can serve as both the transmitter and receiver of the probe, which reduces the complexity of synchronizing and coordinating probes among multiple probe points. On the other hand, in order to reduce redundant telemetry data, a telemetry data indication field is added to the probe data group to specify the telemetry data to be collected. Finally, embedding the state information inside the programmable device into the probes can be achieved by customizing the data grouping processing logic through the customization capability of the programmable device.
