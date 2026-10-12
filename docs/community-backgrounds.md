# 社区动态背景

寄语页面使用 React Bits Scanner 源码，保留原版干涉扫描带，配色取自现有蓝灰、桃色、米白空间。依赖 OGL；降低像素倍率、添加初始化失败回退和减少动态效果偏好下的静态渲染。

问答论坛使用 React Bits Gradient Waves 源码，浅暖灰地平线、雾蓝波浪与浅蓝灰波峰构成动态背景。背景固定在视口后方，保留话题滚轮、搜索、分页及弹窗功能；使用低细节和单倍像素倍率，并提供减少动态效果偏好下的静态呈现。

两个背景不接收指针事件，阅读、拖拽和滚动由现有界面处理。进入寄语全屏时 Scanner 随根容器填充。

源码文件位于 `components/community/ReactBitsScanner.jsx`、`ReactBitsGradientWaves.jsx`。均保留 React Bits MIT + Commons Clause 许可，许可文件为 `components/profile/REACT-BITS-LICENSE.md`。

来源：
- https://reactbits.dev/backgrounds/scanner
- https://reactbits.dev/backgrounds/gradient-waves

论坛左侧话题筛选使用 https://reactbits.dev/components/option-wheel 的原版曲线布局和缓动源码。增加受控选中项同步、中文无障碍标签、话题数量、Home/End 键和减少动态效果支持；滚轮、拖拽、键盘及卡片话题按钮统一更新筛选条件。许可同上。

验证：类型检查、实时着色器运行、寄语拖拽与阅读、论坛筛选/搜索与讨论弹窗，以及手机横向溢出检查。
