# Smart Table 组件

**专处理纯静态table固定头列及排序功能**

此组件库常用于服务端处理数据后直接返回HTML渲染，在客户端需要表格的多样化功能。

-- 初衷 --

  方便在服务端直接返回已经渲染好的table数据后，增加table的组件功能（如头固定、左右列固定、排序功能）
  此项目不依赖任何其他库

-- 设计 --

  组件内核借鉴虚拟Dom实现，元素排序移动借鉴React的Diff算法实现，保证元素的可重复使用。增加debounce及throttle保证体验。

-- 优势 --

  - 支持多元化头部
  - 轻量，使用方便
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
- 输出静态HTML(表格基础属性需在服务端返回时指定)<br>
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
      tableHeight: 300,
      textAlign: 'left',
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
