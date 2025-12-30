# 大学校徽下载详细指南

## 当前状态

运行 `npm run check-logos` 可以查看哪些大学的校徽已存在，哪些缺失。

## 推荐方法：从 Urongda 网站下载

### 步骤1：访问下载网站

访问：**https://www.urongda.com/download**

该网站提供全国2960所高校的校徽下载，格式为200×200像素的JPG图片。

### 步骤2：下载校徽

1. 在网站上搜索或浏览找到需要的大学
2. 下载对应的校徽图片（通常是JPG格式）
3. 如果需要PNG格式，可以使用在线转换工具转换

### 步骤3：重命名文件

将下载的图片重命名为对应的**大学ID**，格式为：`{大学ID}.png`

**主要大学ID对照表：**

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
| 哈尔滨工业大学 | hit | hit.png |
| 北京理工大学 | bit | bit.png |
| 南开大学 | nankai | nankai.png |
| 天津大学 | tju | tju.png |
| 东南大学 | seu | seu.png |
| 武汉大学 | whu | whu.png |
| 华中科技大学 | hust | hust.png |
| 中山大学 | sysu | sysu.png |
| 华南理工大学 | scut | scut.png |
| 四川大学 | scu | scu.png |
| 电子科技大学 | uestc | uestc.png |
| 重庆大学 | cqu | cqu.png |
| 山东大学 | sdu | sdu.png |
| 中国海洋大学 | ouc | ouc.png |
| 吉林大学 | jlu | jlu.png |
| 大连理工大学 | dlut | dlut.png |
| 东北大学 | neu | neu.png |
| 湖南大学 | hnu | hnu.png |
| 中南大学 | csu | csu.png |
| 厦门大学 | xmu | xmu.png |
| 兰州大学 | lzu | lzu.png |
| 中国人民大学 | ruc | ruc.png |
| 北京航空航天大学 | buaa | buaa.png |
| 北京师范大学 | bnu | bnu.png |
| 中央民族大学 | muc | muc.png |
| 华东师范大学 | ecnu | ecnu.png |
| 同济大学 | tongji | tongji.png |
| 中国农业大学 | cau | cau.png |
| 西北工业大学 | nwpu | nwpu.png |
| 西北农林科技大学 | nwafu | nwafu.png |
| 国防科技大学 | nudt | nudt.png |
| 西安电子科技大学 | xidian | xidian.png |
| 陕西师范大学 | snnu | snnu.png |
| 西北大学 | nwu | nwu.png |
| 长安大学 | chd | chd.png |
| 北京邮电大学 | bupt | bupt.png |
| 中央财经大学 | cufe | cufe.png |
| 对外经济贸易大学 | uibe | uibe.png |
| 北京外国语大学 | bfsu | bfsu.png |
| 中国传媒大学 | cuc | cuc.png |
| 中国地质大学（北京） | cugb | cugb.png |
| 中国石油大学（北京） | cup | cup.png |
| 中国地质大学（武汉） | cug | cug.png |
| 南京理工大学 | njust | njust.png |
| 南京航空航天大学 | nuaa | nuaa.png |
| 河海大学 | hhu | hhu.png |
| 苏州大学 | suda | suda.png |
| 南京师范大学 | njnu | njnu.png |
| 华中师范大学 | hustc | hustc.png |
| 西南财经大学 | swufe | swufe.png |

### 步骤4：放入项目目录

将重命名后的图片文件放入项目的 `public/logos/` 目录。

**完整路径示例：**
```
宝中大学论坛/
  └── public/
      └── logos/
          ├── pku.png (已存在)
          ├── tsinghua.png
          ├── fudan.png
          └── ...
```

### 步骤5：验证

1. 运行 `npm run check-logos` 检查哪些文件已添加
2. 访问大学详情页面，查看校徽是否正确显示
3. 如果显示默认头像，检查文件名是否与大学ID完全一致

## 其他资源

### 方法2：矢量校徽网站

访问：**https://nav.weyondesign.com/sites/1567.html**

- 提供SVG和PNG格式的矢量校徽
- 支持免费下载
- 需要转换为PNG格式（如果需要）

### 方法3：CSDN资源

访问：**https://blog.csdn.net/nicklies/article/details/148383219**

- 提供全国2960多所大学的校徽打包下载
- 格式：200×200像素的JPG
- 下载后需要解压并重命名

## 图片要求

- **格式**：PNG（推荐）或 JPG
- **尺寸**：建议 200×200 像素或更高
- **命名**：必须使用大学ID作为文件名，如 `pku.png`
- **位置**：`public/logos/` 目录

## 快速检查命令

```bash
# 检查哪些校徽已存在，哪些缺失
npm run check-logos

# 尝试自动下载（可能失败，因为在线资源受限）
npm run download-logos
```

## 注意事项

1. **文件名必须完全匹配**：`pku.png` 不能写成 `PKU.png` 或 `pku.PNG`
2. **文件扩展名**：建议使用 `.png`，如果下载的是 `.jpg`，可以重命名为 `.png` 或修改代码支持 `.jpg`
3. **文件大小**：如果文件小于100字节，可能是损坏的文件
4. **版权**：使用校徽图片时，请遵守相关的版权和使用规定

## 批量下载建议

如果需要下载大量大学的校徽：

1. 从 Urongda 网站下载完整的校徽包
2. 解压后，根据大学名称找到对应的图片
3. 使用脚本批量重命名（需要知道大学名称到ID的映射）
4. 或者手动逐个重命名并放入 `public/logos/` 目录

## 问题排查

如果校徽不显示：

1. ✅ 检查文件是否存在：运行 `npm run check-logos`
2. ✅ 检查文件名是否正确：必须与大学ID完全一致
3. ✅ 检查文件路径：应该在 `public/logos/` 目录
4. ✅ 检查文件大小：应该大于100字节
5. ✅ 清除浏览器缓存并刷新页面
6. ✅ 检查浏览器控制台是否有错误信息


