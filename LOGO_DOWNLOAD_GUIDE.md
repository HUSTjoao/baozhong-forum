# 大学校徽下载指南

## 自动下载（推荐）

运行以下命令自动下载主要大学的校徽：

```bash
npm run download-logos
```

这个脚本会：
- 从维基百科下载主要985大学的校徽图片
- 自动保存到 `public/logos/` 目录
- 使用大学ID作为文件名（如 `pku.png`）

## 手动下载

如果自动下载失败或需要更多大学的校徽，可以手动下载：

### 方法1：Urongda网站（推荐）

1. 访问：https://www.urongda.com/download
2. 该网站提供全国2960所高校的校徽下载
3. 格式：200×200像素的JPEG图片
4. 下载后重命名为对应的大学ID（如 `pku.jpg`）
5. 放入 `public/logos/` 目录

### 方法2：矢量校徽网站

1. 访问：https://nav.weyondesign.com/sites/1567.html
2. 提供SVG和PNG格式的矢量校徽
3. 下载后转换为PNG格式（如果需要）
4. 重命名为对应的大学ID
5. 放入 `public/logos/` 目录

### 方法3：CSDN资源

1. 访问：https://blog.csdn.net/nicklies/article/details/148383219
2. 下载全国2960多所大学的校徽打包文件
3. 解压后找到对应大学的校徽
4. 重命名为对应的大学ID
5. 放入 `public/logos/` 目录

## 大学ID对照表

主要大学的ID如下：

| 大学名称 | ID | 文件名 |
|---------|-----|--------|
| 北京大学 | pku | pku.png |
| 清华大学 | tsinghua | tsinghua.png |
| 复旦大学 | fudan | fudan.png |
| 上海交通大学 | sjtu | sjtu.png |
| 浙江大学 | zju | zju.png |
| 南京大学 | nju | nju.png |
| 中国科学技术大学 | ustc | ustc.png |
| 西安交通大学 | xju | xju.png |
| ... | ... | ... |

完整的大学ID列表请查看 `data/universities.ts` 文件。

## 图片要求

- **格式**：PNG（推荐）或 JPG
- **尺寸**：建议 200×200 像素或更高
- **命名**：使用大学ID作为文件名，如 `pku.png`
- **位置**：`public/logos/` 目录

## 注意事项

1. 确保图片文件名与大学ID完全一致
2. 如果图片加载失败，系统会自动显示默认的首字母头像
3. 使用校徽图片时，请遵守相关的版权和使用规定
4. 建议定期更新校徽图片，保持信息的准确性

## 验证

下载完成后，访问大学详情页面，检查校徽是否正确显示。如果显示默认头像，说明图片文件不存在或命名不正确。



