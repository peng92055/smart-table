# Smart Table 组件
![Badge](https://img.shields.io/badge/Hey!-Everybody-yellow)
![Version](https://img.shields.io/github/package-json/v/peng92055/smart-table)
![build](https://travis-ci.org/peng92055/smart-table.svg?branch=master)
![License](https://img.shields.io/github/license/peng92055/smart-table)

**专处理纯静态table固定头列及排序功能**

此组件库常用于服务端处理数据后直接返回HTML渲染，在客户端需要表格的多样化交互功能。

-- 初衷 --

  在不依赖其他库时，对服务端已返回的完整Table增加客户端的组件交互功能

-- 设计与特点 --
  
  组件内核借鉴虚拟Dom实现，元素排序移动借鉴React的Diff算法实现。使用简洁，组件轻量、性能高。

-- 功能清单 --

  - 头列固定
  - 斑马纹
  - 多级表头
  - 排序
  - 树形结构
  - 单选
  - 多选

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
            <td align="right">DD001</td>
            <td nowrap>2020-01-31</td>
            ...
            <td>889.00</td>
          <tr unsort>
            <td colspan="2">合计</td>
            ...
            <td>18988.00</td>
          ...
          <tr expand="001">  <!-- 指定当前为展开行 -->
          <tr expand-parent="001">  <!-- 指定当前为展开行子项 -->
          <tr expand="001-001" expand-parent="001">  <!-- 指定当前为展开行及为其他行子项 -->
```
- 初始化表格
```javascript
    new SmartTable({
      selector: '#smartTable',
      hoverBgColor: '#C5DFFF',
      height: 300,
      align: 'left',
      size: 'middle',
      selection: 'radio',
      selectionKey: 1,
      expandCallback: function(slot, value) {
        setTimeout(function() {
          var content = "<span>我是展开内容第一次,当前展开的值为：" + value + "</span>"
          slot.open(content, true) //第二个参数为是否需要parseDom 当传递的content为字符串时，该值必须传递true

          var content2 = document.createElement("span")
          content2.innerText = "我是展开内容第二次,当前展开的值为：" + value
          slot.open(content2)
        })
      }
    })
```

### Table Attributes

| Property          | Tag Position           | Description                                                                   | 
| :---------------- | :--------------------- | :---------------------------------------------------------------------------- |
| stripe            | table                  | 表格是否需要斑马间隔色                                                            | 
| fixed             | thead -> tr -> th      | 是否固定该列                                                                     |
| sort              | thead -> tr -> th      | 是否对该列有排序功能（默认按照string排序，可指定为sort="number" ）                    |
| align             | th or td               | 对某一单元格指定水平排列方式                                                       |
| nowrap            | th or td               | 对某一单元格指定内容是否允许换行                                                    |
| unsort            | tbody -> tr            | 可指定body中的某一行不参与排序                                                     |
| expand            | tbody -> tr            | 可指定body中的某一行是否需要展开，  指定expand="001" 001为当前行的ID                  |
| expand-parent     | tbody -> tr            | 可指定body中的某一行是子项，      指定expand-parent="001"  001为父级ID               |


### Table Options

| Property              | Type               | Required    | Description                                                | Default       |
| :---------------------| :----------------- | :---------- | :--------------------------------------------------------- | :------------ |
| selector              | string             | yes         | 需要初始化的表格元素                                           |               |
| height                | number or function | no          | 可指定表格的高度                                              |               |
| align                 | string             | no          | 表格文本的水平排列方式(left、center、right)                    | center        |
| size                  | string             | no          | 每一行的垂直高度风格(large、middle、small)                     | small         |
| hoverBgColor          | string             | no          | body中每行hover时的背景色                                    | '#EFF8FF'     |
| expand                | boolean            | no          | 是否开启树形结构(树形结构会忽略排序及固定列)                      | false        |
| defaultExpandAll      | boolean            | no          | 是否默认展开所有树形结构                                       | false        |
| selection             | string             | no          | 单选或多选（radio、checkbox)，选中值会存储在根节点selected属性上  | false        |
| selectionKey          | string or number   | no          | 单选、多选或展开时选中取值对应的tbody中有效列的角标(角标从0开始)     | 0            |
| radioBgColor          | string             | no          | 单选时，body中选中行的背景色                                   | '#D1E7FF'     |
| expandCallback        | function           | no          | 动态展开行回调函数，回传slot及value参数                       |               |



## 本地开发
### 启动项目
```
npm run serve
```

### build 流程
```
npm run build
```
