# Smart Table 组件
![Badge](https://img.shields.io/badge/Hey!-Everybody-yellow)
![Version](https://img.shields.io/github/package-json/v/peng92055/smart-table)
![License](https://img.shields.io/github/license/peng92055/smart-table)

**专处理纯静态table固定头列及排序功能**

此组件库常用于服务端处理数据后直接返回HTML渲染，在客户端需要表格的多样化交互功能。

-- 初衷 --

  在不依赖任何其他库，服务端已返回table完整数据后，增加table客户端的组件交互功能（如头列固定、排序、斑马纹等）

-- 设计 --
  
  组件内核借鉴虚拟Dom实现，元素排序移动借鉴React的Diff算法实现。

-- 特点 --

  - 支持多元化头部
  - 轻量、使用方便
  - 性能高

## 体验
可直接访问https://peng92055.github.io/smart-table

## Usage
- 加载UI库<br>
  Download the minified library [smartTable.min.js](https://peng92055.github.io/smart-table/smartTable.min.js), and include it in your webpage.
```html
  /* smartTable library */
  <script type="text/javascript" src="js/smartTable.min.js"></script>
```
- 静态HTML(指定表格基础属性)<br>
```html
  <div id="smartTable">
      <table stripe>
        <thead>
          <tr>
            <th fixed sort>Id</th>
            <th colspan="1" rowspan="2" width="200">日期</th>
            ...
            <th fixed>价格</th>  <!-- 右边固定列 -->
        <tbody>
          <tr>
            <td>DD001</td>
            <td>2020-01-31</td>
            ...
            <td>889.00</td>
          <tr unsort>
            <td colspan="2">合计</td>
            ...
            <td>18988.00</td>
```
- 初始化表格
```javascript
    new SmartTable({
      selector: '#smartTable',
      height: 300,
      align: 'left',
      size: 'middle'
    })
```

### Table Attributes

| Property          | Tag Position           | Description                                                       | 
| :---------------- | :--------------------- | :---------------------------------------------------------------- |
| stripe            | table                  | 表格是否需要斑马间隔色                                                | 
| fixed             | thead -> tr -> th      | 是否固定该列                                                        |
| sort              | thead -> tr -> th      | 是否对该列有排序功能（默认按照string排序，可指定为sort="number" ）        |
| unsort            | tbody -> tr            | 可指定body中的某一行不参与排序                                        |


### Table Options

| Property              | Type               | Required    | Description                                 | Default       |
| :---------------------| :----------------- | :---------- | :------------------------------------------ | :------------ |
| selector              | string             | yes         | 需要初始化的表格元素                            |               |
| tableHeight           | number or function | no          | 可指定表格的高度                               |               |
| textAlign             | string             | no          | 表格文本的水平排列方式(left、center、right)      | center        |
| size                  | string             | no          | 每一行的垂直高度风格(large、middle、small)      | small        |

## 本地开发
### 启动项目
```
npm run serve
```

### build 流程
```
npm run build
```
