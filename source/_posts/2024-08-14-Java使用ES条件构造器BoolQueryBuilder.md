---
title: Java使用ES条件构造器BoolQueryBuilder
date: 2024-08-14
updated:
tags: [Java,ElasticSearch,微服务]
categories: 后端
keywords:
description:
top_img: /img/default_top_img.jpg
comments:
cover: /img/cover/java.gif
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

# Java使用ES条件构造器BoolQueryBuilder

## 1. 检索前构造

```java
//1.构建SearchRequest请求对象，指定索引库
SearchRequest searchRequest = new SearchRequest("data_info");
//2.构建SearchSourceBuilder查询对象
SearchSourceBuilder sourceBuilder = new SearchSourceBuilder();
//2.1 这个条件用于返回所有命中条件的数据数量, 不设置则返回大概数值
sourceBuilder.trackTotalHits(true);
//3.检索条件构造
BoolQueryBuilder bqb = QueryBuilders.boolQuery();
```

## 2. 条件构造

- must可用filter代替，查询效率会更高，因为must会对结果进行_score评估

```java
//3.1 完全匹配
bqb.must(QueryBuilders.matchQuery("code", 666L);
         
//3.2 模糊匹配
bqb.must(QueryBuilders.matchPhraseQuery("name", "张");
         
//3.3 in的效果 传单个参数就是完全匹配
bqb.must(QueryBuilders.termsQuery("code", new Long[]{1L, 2L, 3L});
bqb.must(QueryBuilders.termsQuery("code", 1L, 2L, 3L);
         
//3.4 or条件
BoolQueryBuilder shouldQuery = QueryBuilders.boolQuery();
shouldQuery.should(QueryBuilders.matchQuery("code", 1L);
shouldQuery.should(QueryBuilders.matchQuery("code", 2L);
shouldQuery.minimumShouldMatch(1); //至少满足一个
bqb.must(shouldQuery);
                   
//3.5 非null
bqb.must(QueryBuilders.existsQuery("iden"));
//是null             
bqb.mustNot(QueryBuilders.existsQuery("iden"));

//3.6 大于等于gte (gt-大于 lt-小于 lte-小于等于)
bqb.must(QueryBuilders.rangeQuery("time").gte(new Date());
         
//3.7 中文完全匹配
bqb.must(queryBuilder.matchPhraseQuery("key", value));

//3.8 匹配多个字段
bqb.must(queryBuilder.multiMatchQuery(value, key1, key2, key3));

```

## 3. 构造完成进行查询

```java
//4.将BoolQueryBuilder对象设置到SearchSourceBuilder对象中
sourceBuilder.query(bqb);
//5.排序
sourceBuilder.sort("updateTime", SortOrder.DESC);
//6.分页
sourceBuilder.from((dto.getPageNum() - 1) * dto.getPageSize());
sourceBuilder.size(dto.getPageSize());

//7.将SearchSourceBuilder设置到SearchRequest中
searchRequest.source(sourceBuilder);

//8.调用方法查询数据
SearchResponse searchResponse = client.search(searchRequest, RequestOptions.DEFAULT);
         
//9.解析返回结果
SearchHit[] hits = searchResponse.getHits().getHits();
for (int i = 0; i < hits.length; i++) {
    System.out.println("返回的结果： " + hits[i].getSourceAsString());
}

log.info("返回总数为：" + searchResponse.getHits().getTotalHits());
int total = (int)searchResponse.getHits().getTotalHits().value;

```

