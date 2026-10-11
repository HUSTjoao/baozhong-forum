// Display translations for the canonical undergraduate major catalog.
const names = `
计算机科学与技术|Computer Science and Technology
软件工程|Software Engineering
电子信息工程|Electronic Information Engineering
数学与应用数学|Mathematics and Applied Mathematics
物理学|Physics
汉语言文学|Chinese Language and Literature
法学|Law
人工智能|Artificial Intelligence
数据科学与大数据技术|Data Science and Big Data Technology
自动化|Automation
机械工程|Mechanical Engineering
电气工程及其自动化|Electrical Engineering and Automation
通信工程|Communication Engineering
网络工程|Network Engineering
物联网工程|Internet of Things Engineering
信息安全|Information Security
建筑学|Architecture
土木工程|Civil Engineering
材料科学与工程|Materials Science and Engineering
化学工程与工艺|Chemical Engineering and Technology
生物医学工程|Biomedical Engineering
统计学|Statistics
应用物理学|Applied Physics
化学|Chemistry
生物科学|Biological Sciences
信息与计算科学|Information and Computing Science
经济学|Economics
金融学|Finance
会计学|Accounting
工商管理|Business Administration
新闻学|Journalism
英语|English
国际经济与贸易|International Economics and Trade
心理学|Psychology
环境工程|Environmental Engineering
能源与动力工程|Energy and Power Engineering
航空航天工程|Aerospace Engineering
核工程与核技术|Nuclear Engineering and Technology
光电信息科学与工程|Optoelectronic Information Science and Engineering
车辆工程|Vehicle Engineering
船舶与海洋工程|Naval Architecture and Ocean Engineering
食品科学与工程|Food Science and Engineering
纺织工程|Textile Engineering
采矿工程|Mining Engineering
石油工程|Petroleum Engineering
交通运输|Transportation
水利水电工程|Hydraulic and Hydropower Engineering
印刷工程|Printing Engineering
包装工程|Packaging Engineering
应用化学|Applied Chemistry
生物技术|Biotechnology
地质学|Geology
地球物理学|Geophysics
大气科学|Atmospheric Sciences
海洋科学|Marine Science
生态学|Ecology
地理科学|Geography
天文学|Astronomy
应用心理学|Applied Psychology
生物信息学|Bioinformatics
地理信息科学|Geographic Information Science
材料物理|Materials Physics
历史学|History
哲学|Philosophy
社会学|Sociology
政治学与行政学|Political Science and Public Administration
国际政治|International Politics
教育学|Education
汉语国际教育|Teaching Chinese to Speakers of Other Languages
日语|Japanese
广告学|Advertising
旅游管理|Tourism Management
临床医学|Clinical Medicine
口腔医学|Stomatology
预防医学|Preventive Medicine
中医学|Traditional Chinese Medicine
中西医临床医学|Integrated Chinese and Western Clinical Medicine
儿科学|Pediatrics
麻醉学|Anesthesiology
医学影像学|Medical Imaging
康复治疗学|Rehabilitation Therapy
护理学|Nursing
药学|Pharmacy
制药工程|Pharmaceutical Engineering
临床药学|Clinical Pharmacy
应用统计学|Applied Statistics
地球系统科学|Earth System Science
系统科学与工程|Systems Science and Engineering
文物与博物馆学|Cultural Heritage and Museology
翻译|Translation
考古学|Archaeology
文化产业管理|Cultural Industry Management
环境科学|Environmental Science
飞行器设计与工程|Aircraft Design and Engineering
交通工程|Traffic Engineering
安全工程|Safety Engineering
测绘工程|Surveying and Mapping Engineering
物流工程|Logistics Engineering
市场营销|Marketing
播音与主持艺术|Broadcasting and Hosting Arts
公共事业管理|Public Affairs Administration
社会工作|Social Work
视觉传达设计|Visual Communication Design
音乐表演|Music Performance
医学检验技术|Medical Laboratory Technology
眼视光医学|Optometry and Ophthalmology
放射医学|Radiation Medicine
精神医学|Psychiatry
机器人工程|Robotics Engineering
智能科学与技术|Intelligence Science and Technology
集成电路设计与集成系统|Integrated Circuit Design and Integrated Systems
微电子科学与工程|Microelectronics Science and Engineering
测控技术与仪器|Measurement and Control Technology and Instrumentation
能源与环境系统工程|Energy and Environmental Systems Engineering
复合材料与工程|Composite Materials and Engineering
工业设计|Industrial Design
过程装备与控制工程|Process Equipment and Control Engineering
港口航道与海岸工程|Port, Waterway and Coastal Engineering
飞行器动力工程|Aircraft Propulsion Engineering
飞行器制造工程|Aircraft Manufacturing Engineering
弹药工程与爆炸技术|Ammunition Engineering and Explosive Technology
辐射防护与核安全|Radiation Protection and Nuclear Safety
假肢矫形工程|Prosthetics and Orthotics Engineering
农业机械化及其自动化|Agricultural Mechanization and Automation
森林工程|Forest Engineering
木材科学与工程|Wood Science and Engineering
动物医学|Veterinary Medicine
动植物检疫|Animal and Plant Quarantine
水产养殖学|Aquaculture
园林|Landscape Gardening
茶学|Tea Science
酿酒工程|Brewing Engineering
非织造材料与工程|Nonwoven Materials and Engineering
数字媒体技术|Digital Media Technology
区块链工程|Blockchain Engineering
金融科技|Financial Technology
金融工程|Financial Engineering
财政学|Public Finance
税收学|Taxation
保险学|Insurance
财务管理|Financial Management
审计学|Auditing
人力资源管理|Human Resource Management
行政管理|Public Administration
电子商务|Electronic Commerce
物流管理|Logistics Management
信息管理与信息系统|Information Management and Information Systems
学前教育|Early Childhood Education
小学教育|Primary Education
特殊教育|Special Education
网络与新媒体|Internet and New Media
传播学|Communication Studies
德语|German
法语|French
俄语|Russian
机械设计制造及其自动化|Mechanical Design, Manufacturing and Automation
机械电子工程|Mechatronic Engineering
智能制造工程|Intelligent Manufacturing Engineering
网络空间安全|Cyberspace Security
电子科学与技术|Electronic Science and Technology
新能源科学与工程|New Energy Science and Engineering
储能科学与工程|Energy Storage Science and Engineering
高分子材料与工程|Polymer Materials and Engineering
生物工程|Bioengineering
生物制药|Biopharmaceutical Engineering
食品质量与安全|Food Quality and Safety
城乡规划|Urban and Rural Planning
风景园林|Landscape Architecture
遥感科学与技术|Remote Sensing Science and Technology
工程力学|Engineering Mechanics
化学生物学|Chemical Biology
地球化学|Geochemistry
自然地理与资源环境|Physical Geography and Resource Environment
人文地理与城乡规划|Human Geography and Urban-Rural Planning
基础医学|Basic Medicine
法医学|Forensic Medicine
中药学|Chinese Pharmacy
医学影像技术|Medical Imaging Technology
眼视光学|Optometry
针灸推拿学|Acupuncture and Tuina
农学|Agronomy
园艺|Horticulture
植物保护|Plant Protection
动物科学|Animal Science
林学|Forestry
动画|Animation
数字媒体艺术|Digital Media Art
环境设计|Environmental Design
产品设计|Product Design
音乐学|Musicology
体育教育|Physical Education
运动训练|Sports Training
`
export const majorEnglishNames: Record<string, string> = Object.fromEntries(names.trim().split('\n').map(line => line.trim().split('|')))
