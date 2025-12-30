export type MajorCategory = 'science' | 'engineering' | 'arts' | 'medicine'

export interface Major {
  id: string
  name: string
  category: MajorCategory // 理科 / 工科 / 文科
  description: string
  hotScore: number // 热度，用于排序
  strongUniversities: string[] // 在该专业上较强的大学ID列表（对应 universities.ts 中的 id）
  isUserAdded?: boolean
  // 管理员审核状态：未设置或 true 视为已通过，仅用户新增的数据会用到该字段
  isApproved?: boolean
  // 审核状态：pending 待阅 / approved 已阅 / rejected 被拒
  reviewStatus?: 'pending' | 'approved' | 'rejected'
  // 拒绝原因
  rejectionReason?: string
  // 提交者
  creatorId?: string
}

// 预置专业数据
export const majors: Major[] = [
  {
    id: 'cs',
    name: '计算机科学与技术',
    category: 'engineering',
    hotScore: 100,
    strongUniversities: ['tsinghua', 'pku', 'zju', 'sjtu', 'ustc', 'xju', 'uestc', 'scut', 'hust', 'hfut', 'hdu'],
    description:
      '计算机科学与技术专业主要研究计算机系统的组成原理、软硬件开发方法与应用技术。核心课程包括数据结构与算法、操作系统、计算机网络、数据库系统、编译原理、人工智能等。毕业生可从事软件开发、算法工程、系统架构、产品研发、技术管理等工作，就业方向涵盖互联网公司、金融机构、制造业、科研院所等，整体就业前景好、薪资水平高，但学习过程中需要扎实的数学基础和大量的实践训练。',
  },
  {
    id: 'se',
    name: '软件工程',
    category: 'engineering',
    hotScore: 92,
    strongUniversities: ['tsinghua', 'zju', 'sjtu', 'uestc', 'scut', 'hust', 'hfut', 'hdu', 'zjut'],
    description:
      '软件工程专业以工程化方法开发和维护软件为核心，强调需求分析、系统设计、编码实现、测试与运维的完整流程。课程通常涵盖软件工程导论、需求工程、软件体系结构、软件测试、项目管理、敏捷开发等内容，并通过团队项目训练学生的协作与工程实践能力。毕业生可在互联网企业、传统行业的信息化部门从事软件开发工程师、测试工程师、项目经理等岗位，适合喜欢做项目、善于沟通协作的同学。',
  },
  {
    id: 'ee',
    name: '电子信息工程',
    category: 'engineering',
    hotScore: 88,
    strongUniversities: ['xidian', 'uestc', 'scut', 'hust', 'xju', 'hit', 'hdu', 'bupt'],
    description:
      '电子信息工程专业主要研究电子设备与信息系统的设计、开发与应用，涉及电路、信号与系统、通信原理、数字信号处理、嵌入式系统等内容。该专业既有偏硬件的电路与系统设计，也有偏软件的信号处理与通信算法，需要较好的数学和物理基础。毕业生可在通信运营商、通信设备厂商、电子类企业和科研院所从事硬件开发、通信系统设计、信号处理算法开发等工作。',
  },
  {
    id: 'math',
    name: '数学与应用数学',
    category: 'science',
    hotScore: 85,
    strongUniversities: ['pku', 'tsinghua', 'zju', 'nju', 'ustc', 'ruc', 'sdu'],
    description:
      '数学与应用数学专业注重数学基础理论与应用能力的培养，主干课程包括高等代数、数学分析、常微分方程、概率论与数理统计、实变函数、复变函数等。该专业训练同学的逻辑思维能力和抽象思维能力，是很多交叉学科（如人工智能、金融工程、量化分析）的重要基础。毕业去向包括继续深造、进入高校和科研机构，以及到金融、互联网、咨询等行业从事建模分析、算法研究等工作。',
  },
  {
    id: 'physics',
    name: '物理学',
    category: 'science',
    hotScore: 78,
    strongUniversities: ['pku', 'tsinghua', 'ustc', 'nju', 'zju', 'hit', 'sdu'],
    description:
      '物理学专业主要研究自然界中物质的基本结构及其运动规律，涵盖力学、电磁学、热学、光学、量子力学、统计物理等方向。学习过程对数学要求较高，需要同学具有较强的抽象思维和耐心。毕业后既可以继续攻读研究生从事基础研究，也可以转向材料、电子、能源、金融工程等应用领域，就业方向相对宽广但更加依赖后续深造与个人发展规划。',
  },
  {
    id: 'chinese',
    name: '汉语言文学',
    category: 'arts',
    hotScore: 83,
    strongUniversities: ['pku', 'nju', 'whu', 'bnu', 'snnu', 'yau', 'bjwlxy'],
    description:
      '汉语言文学专业主要研究中国语言文字及古今文学作品，课程包括现代汉语、古代汉语、中国文学史、文学概论、写作学等。专业强调阅读与写作能力，适合喜欢文学、对文字敏感的同学。毕业后可从事中学语文教师、编辑、记者、公务员、新媒体内容运营等工作，也可以继续深造从事学术研究，是打基础、可转向多种人文社科方向的专业。',
  },
  {
    id: 'law',
    name: '法学',
    category: 'arts',
    hotScore: 90,
    strongUniversities: ['ruc', 'cufe', 'pku', 'whu', 'cau', 'swufe', 'nwsuaf'],
    description:
      '法学专业系统学习宪法、民法、刑法、行政法、经济法、国际法等法律部门的基本理论与制度，培养学生的法学思维与法律实务能力。学习过程中需要大量阅读法规与案例，训练严谨的逻辑推理和分析论证能力。毕业后可通过司法考试从事律师、法官、检察官等职业，也可在企事业单位、政府机关从事法务、合规、政策研究等工作。',
  },
  {
    id: 'ai',
    name: '人工智能',
    category: 'engineering',
    hotScore: 98,
    strongUniversities: ['tsinghua', 'pku', 'zju', 'sjtu', 'ustc', 'nju', 'xju', 'uestc', 'scut'],
    description:
      '人工智能专业是计算机科学的一个分支，主要研究如何让机器模拟人类智能，包括机器学习、深度学习、自然语言处理、计算机视觉等方向。核心课程包括人工智能导论、机器学习、神经网络、数据挖掘、模式识别等。毕业生可在互联网公司、科技企业、科研院所从事算法工程师、AI产品经理、研究科学家等工作，是当前最热门的专业之一，就业前景广阔，薪资水平高。',
  },
  {
    id: 'ds',
    name: '数据科学与大数据技术',
    category: 'engineering',
    hotScore: 95,
    strongUniversities: ['tsinghua', 'pku', 'zju', 'sjtu', 'ustc', 'nju', 'xju', 'uestc'],
    description:
      '数据科学与大数据技术专业培养具备数据科学理论基础和大数据处理能力的人才，涵盖统计学、机器学习、数据库、分布式计算等内容。主要课程包括数据科学导论、大数据技术、数据挖掘、数据可视化、云计算等。毕业生可在互联网、金融、电商、政府等领域从事数据分析师、数据工程师、算法工程师等岗位，随着大数据时代的到来，该专业需求量大、发展前景好。',
  },
  {
    id: 'auto',
    name: '自动化',
    category: 'engineering',
    hotScore: 87,
    strongUniversities: ['tsinghua', 'zju', 'sjtu', 'xju', 'hit', 'hust', 'neu', 'scut'],
    description:
      '自动化专业以控制理论为基础，研究自动控制系统设计、分析与优化，涉及工业自动化、智能控制、机器人技术等方向。核心课程包括自动控制原理、现代控制理论、过程控制、计算机控制技术、机器人学等。毕业生可在制造业、电力系统、航空航天、机器人等领域从事自动化系统设计、控制算法开发、系统集成等工作，就业面广，是传统工科中的热门专业。',
  },
  {
    id: 'me',
    name: '机械工程',
    category: 'engineering',
    hotScore: 82,
    strongUniversities: ['tsinghua', 'sjtu', 'hit', 'xju', 'hust', 'scut', 'csu', 'dlut'],
    description:
      '机械工程专业是工程学科中最广泛的专业之一，主要研究机械设计、制造、自动化等方面的理论与技术。核心课程包括机械设计、机械制造基础、材料力学、理论力学、机械原理、CAD/CAM等。毕业生可在制造业、汽车工业、航空航天、能源等领域从事机械设计、工艺设计、生产管理、研发等工作，是传统制造业的核心专业，就业稳定。',
  },
  {
    id: 'ee-auto',
    name: '电气工程及其自动化',
    category: 'engineering',
    hotScore: 85,
    strongUniversities: ['tsinghua', 'sjtu', 'xju', 'hit', 'hust', 'scut', 'cqu', 'hebut'],
    description:
      '电气工程及其自动化专业主要研究电力系统、电机与电器、电力电子技术、自动控制等方面的理论与应用。核心课程包括电路理论、电机学、电力系统分析、电力电子技术、自动控制原理等。毕业生可在电力系统、电气设备制造、自动化企业、新能源等领域从事设计、研发、运行管理等工作，是电力行业的核心专业，就业稳定且待遇较好。',
  },
  {
    id: 'comm',
    name: '通信工程',
    category: 'engineering',
    hotScore: 89,
    strongUniversities: ['xidian', 'uestc', 'bupt', 'scut', 'hust', 'xju', 'hit', 'hdu'],
    description:
      '通信工程专业主要研究通信系统、信号处理、无线通信、光通信等方面的理论与技术。核心课程包括通信原理、数字信号处理、移动通信、光纤通信、信息论等。毕业生可在通信运营商、通信设备厂商、互联网公司从事通信系统设计、网络优化、产品研发等工作，随着5G、6G技术的发展，该专业前景持续看好。',
  },
  {
    id: 'net',
    name: '网络工程',
    category: 'engineering',
    hotScore: 86,
    strongUniversities: ['xidian', 'uestc', 'bupt', 'scut', 'hust', 'xiyou', 'hdu'],
    description:
      '网络工程专业主要研究计算机网络的设计、建设、管理与维护，涉及网络架构、网络安全、云计算、物联网等内容。核心课程包括计算机网络、网络协议、网络安全、网络管理、云计算技术等。毕业生可在互联网公司、电信运营商、企业IT部门从事网络工程师、系统架构师、网络安全工程师等工作，随着网络基础设施的不断发展，需求量大。',
  },
  {
    id: 'iot',
    name: '物联网工程',
    category: 'engineering',
    hotScore: 84,
    strongUniversities: ['xidian', 'uestc', 'bupt', 'scut', 'hust', 'xiyou', 'hdu'],
    description:
      '物联网工程专业是计算机、通信、电子等多学科交叉的新兴专业，主要研究物联网系统的设计、开发与应用。核心课程包括物联网导论、传感器技术、嵌入式系统、无线传感器网络、物联网应用开发等。毕业生可在智能家居、智慧城市、工业互联网等领域从事物联网系统设计、产品开发、解决方案设计等工作，是未来智能化发展的重要方向。',
  },
  {
    id: 'infosec',
    name: '信息安全',
    category: 'engineering',
    hotScore: 91,
    strongUniversities: ['xidian', 'uestc', 'bupt', 'scut', 'hust', 'xiyou', 'hdu'],
    description:
      '信息安全专业主要研究信息系统安全防护、密码学、网络安全、数据安全等方面的理论与技术。核心课程包括密码学、网络安全、信息系统安全、恶意代码分析、安全协议等。毕业生可在政府部门、金融机构、互联网公司、安全厂商从事信息安全工程师、安全分析师、渗透测试工程师等工作，随着网络安全威胁的加剧，该专业需求量大且薪资水平高。',
  },
  {
    id: 'arch',
    name: '建筑学',
    category: 'engineering',
    hotScore: 80,
    strongUniversities: ['tsinghua', 'tongji', 'seu', 'xauat', 'scut', 'tju', 'cqu'],
    description:
      '建筑学专业是技术与艺术相结合的专业，主要研究建筑设计、城市规划、建筑历史与理论等。核心课程包括建筑设计、建筑构造、建筑历史、城市规划原理、建筑物理等。学制通常为五年，需要较强的空间想象力和艺术素养。毕业生可在建筑设计院、房地产公司、规划部门从事建筑师、规划师等工作，是传统热门专业，就业稳定但需要较强的专业能力。',
  },
  {
    id: 'civil',
    name: '土木工程',
    category: 'engineering',
    hotScore: 79,
    strongUniversities: ['tongji', 'seu', 'tsinghua', 'xauat', 'scut', 'tju', 'cqu', 'chd'],
    description:
      '土木工程专业主要研究各类工程设施的规划、设计、施工与管理，包括建筑工程、道路桥梁、水利工程等方向。核心课程包括结构力学、材料力学、混凝土结构、钢结构、土力学、基础工程等。毕业生可在建筑公司、设计院、房地产公司、政府部门从事结构设计、施工管理、工程监理等工作，是基础设施建设的重要专业，就业面广。',
  },
  {
    id: 'materials',
    name: '材料科学与工程',
    category: 'engineering',
    hotScore: 76,
    strongUniversities: ['tsinghua', 'ustb', 'sjtu', 'hit', 'scut', 'csu', 'suda'],
    description:
      '材料科学与工程专业主要研究材料的组成、结构、性能及其制备与应用，包括金属材料、无机非金属材料、高分子材料等方向。核心课程包括材料科学基础、材料物理、材料化学、材料力学性能、材料制备技术等。毕业生可在材料制造企业、科研院所、航空航天、汽车工业等领域从事材料研发、工艺设计、质量控制等工作，是制造业的基础专业。',
  },
  {
    id: 'chem-eng',
    name: '化学工程与工艺',
    category: 'engineering',
    hotScore: 75,
    strongUniversities: ['tju', 'buct', 'dlut', 'scut', 'suda', 'jiangnan', 'tyut'],
    description:
      '化学工程与工艺专业主要研究化工过程的设计、优化与控制，涉及化学反应工程、分离工程、化工热力学等内容。核心课程包括化工原理、化学反应工程、化工热力学、化工设计、化工安全等。毕业生可在化工、石油、制药、环保等行业从事工艺设计、生产管理、技术研发等工作，是传统化工行业的核心专业。',
  },
  {
    id: 'bme',
    name: '生物医学工程',
    category: 'engineering',
    hotScore: 81,
    strongUniversities: ['tsinghua', 'seu', 'sjtu', 'zju', 'scut', 'uestc', 'hust'],
    description:
      '生物医学工程是工程学与医学、生物学交叉的新兴专业，主要研究医疗设备、生物材料、医学影像、生物信息等方面的技术。核心课程包括生物医学信号处理、医学影像技术、生物材料、生物力学、医疗器械设计等。毕业生可在医疗器械公司、医院、科研院所从事医疗设备研发、医学影像技术、生物材料研究等工作，是医疗科技发展的重要方向。',
  },
  {
    id: 'stats',
    name: '统计学',
    category: 'science',
    hotScore: 88,
    strongUniversities: ['ruc', 'xmu', 'ecnu', 'swufe', 'cufe', 'xmu', 'nwnu'],
    description:
      '统计学专业主要研究数据的收集、整理、分析和解释，是现代数据科学的重要基础。核心课程包括概率论、数理统计、统计推断、回归分析、时间序列分析、多元统计分析等。毕业生可在金融、保险、互联网、咨询、政府部门从事数据分析、风险评估、市场研究等工作，随着大数据时代的到来，该专业需求量大、应用面广。',
  },
  {
    id: 'app-physics',
    name: '应用物理学',
    category: 'science',
    hotScore: 74,
    strongUniversities: ['pku', 'tsinghua', 'ustc', 'nju', 'zju', 'hit', 'sdu'],
    description:
      '应用物理学专业在物理学基础上，注重物理原理在实际中的应用，包括光电子、半导体、凝聚态物理等方向。核心课程包括理论物理、固体物理、半导体物理、光电子技术、激光原理等。毕业生可在电子、通信、材料、能源等领域从事研发工作，也可以继续深造从事科研，是连接基础科学与应用技术的桥梁专业。',
  },
  {
    id: 'chemistry',
    name: '化学',
    category: 'science',
    hotScore: 72,
    strongUniversities: ['pku', 'nju', 'fudan', 'ustc', 'zju', 'sdu', 'nankai'],
    description:
      '化学专业主要研究物质的组成、结构、性质及其变化规律，包括无机化学、有机化学、物理化学、分析化学等方向。核心课程包括无机化学、有机化学、物理化学、分析化学、结构化学等。毕业生可在化工、制药、材料、环保、食品等行业从事研发、分析检测、质量控制等工作，也可以继续深造从事科研，是基础学科中的重要专业。',
  },
  {
    id: 'biology',
    name: '生物科学',
    category: 'science',
    hotScore: 73,
    strongUniversities: ['pku', 'tsinghua', 'fudan', 'zju', 'sysu', 'scu', 'ccnu'],
    description:
      '生物科学专业主要研究生命现象及其规律，包括分子生物学、细胞生物学、遗传学、生态学等方向。核心课程包括生物化学、细胞生物学、遗传学、分子生物学、生态学等。毕业生可在生物技术公司、制药企业、科研院所、环保部门从事研发、检测、管理等工作，也可以继续深造从事科研，是生命科学领域的基础专业。',
  },
  {
    id: 'ics',
    name: '信息与计算科学',
    category: 'science',
    hotScore: 83,
    strongUniversities: ['pku', 'tsinghua', 'zju', 'nju', 'ustc', 'ruc', 'sdu'],
    description:
      '信息与计算科学专业是数学与计算机科学交叉的专业，主要研究信息处理与科学计算的理论与方法。核心课程包括数学分析、高等代数、概率论、数值分析、数据结构、算法设计等。毕业生可在金融、互联网、科研院所从事算法开发、数据分析、科学计算等工作，既有扎实的数学基础，又具备编程能力，就业面广。',
  },
  {
    id: 'economics',
    name: '经济学',
    category: 'arts',
    hotScore: 87,
    strongUniversities: ['ruc', 'pku', 'fudan', 'xmu', 'swufe', 'cufe', 'uibe'],
    description:
      '经济学专业主要研究经济运行规律、资源配置、市场机制等经济理论，包括微观经济学、宏观经济学、计量经济学等方向。核心课程包括政治经济学、微观经济学、宏观经济学、计量经济学、国际经济学等。毕业生可在金融机构、政府部门、企业、咨询公司从事经济分析、政策研究、投资分析等工作，是社会科学中的热门专业。',
  },
  {
    id: 'finance',
    name: '金融学',
    category: 'arts',
    hotScore: 93,
    strongUniversities: ['ruc', 'cufe', 'swufe', 'uibe', 'fudan', 'xmu', 'cufe'],
    description:
      '金融学专业主要研究货币、银行、证券、保险等金融领域的理论与实务，包括货币银行学、证券投资、保险学、国际金融等方向。核心课程包括金融学、投资学、商业银行经营学、国际金融、金融工程等。毕业生可在银行、证券公司、保险公司、基金公司、投资公司从事金融分析、投资管理、风险管理等工作，是财经类专业中最热门的专业之一，就业前景好、薪资水平高。',
  },
  {
    id: 'accounting',
    name: '会计学',
    category: 'arts',
    hotScore: 88,
    strongUniversities: ['cufe', 'swufe', 'ruc', 'uibe', 'xmu', 'cufe', 'swufe'],
    description:
      '会计学专业主要研究会计理论、财务管理、审计等方面的知识，培养具备会计核算、财务分析、审计等能力的人才。核心课程包括会计学原理、中级财务会计、高级财务会计、财务管理、审计学、税法等。毕业生可在会计师事务所、企业财务部门、金融机构、政府部门从事会计、审计、财务管理等工作，是传统热门专业，就业稳定。',
  },
  {
    id: 'business',
    name: '工商管理',
    category: 'arts',
    hotScore: 85,
    strongUniversities: ['tsinghua', 'pku', 'ruc', 'fudan', 'sjtu', 'zju', 'swufe'],
    description:
      '工商管理专业主要研究企业管理、市场营销、人力资源、战略管理等管理理论与方法。核心课程包括管理学、市场营销、人力资源管理、财务管理、战略管理、运营管理等。毕业生可在各类企业从事管理、营销、人力资源、咨询等工作，也可以自主创业，是培养管理人才的重要专业，就业面广但需要较强的综合能力。',
  },
  {
    id: 'journalism',
    name: '新闻传播学',
    category: 'arts',
    hotScore: 82,
    strongUniversities: ['cuc', 'fudan', 'ruc', 'bfsu', 'whu', 'sysu', 'xisu'],
    description:
      '新闻传播学专业主要研究新闻采写、编辑、传播理论、新媒体等内容，培养具备新闻采编、媒体运营、传播策划等能力的人才。核心课程包括新闻学概论、传播学概论、新闻采访与写作、新闻编辑、新媒体概论、广告学等。毕业生可在媒体、广告公司、企业宣传部门、新媒体公司从事记者、编辑、内容运营、品牌传播等工作，随着新媒体发展，就业形式多样化。',
  },
  {
    id: 'english',
    name: '英语',
    category: 'arts',
    hotScore: 80,
    strongUniversities: ['bfsu', 'shisu', 'xisu', 'fudan', 'nju', 'sysu', 'ecnu'],
    description:
      '英语专业主要研究英语语言、文学、文化，培养具备英语听说读写译能力的人才。核心课程包括综合英语、英语阅读、英语写作、翻译理论与实践、英美文学、语言学概论等。毕业生可在教育、外贸、翻译、旅游、外企等领域从事英语教师、翻译、外贸业务员、国际交流等工作，是传统外语专业，就业面广但需要较强的语言能力。',
  },
  {
    id: 'iet',
    name: '国际经济与贸易',
    category: 'arts',
    hotScore: 84,
    strongUniversities: ['uibe', 'fudan', 'ruc', 'swufe', 'cufe', 'xmu', 'uibe'],
    description:
      '国际经济与贸易专业主要研究国际贸易理论、政策与实务，培养具备国际贸易操作能力的人才。核心课程包括国际贸易理论、国际贸易实务、国际金融、国际商法、外贸英语函电等。毕业生可在外贸公司、跨国公司、金融机构、政府部门从事国际贸易、国际商务、外贸业务等工作，随着全球化发展，该专业仍有较好的就业前景。',
  },
  {
    id: 'psychology',
    name: '心理学',
    category: 'arts',
    hotScore: 86,
    strongUniversities: ['bnu', 'ecnu', 'hustc', 'pku', 'ruc', 'swu', 'snnu'],
    description:
      '心理学专业主要研究人类心理现象及其规律，包括认知心理学、发展心理学、社会心理学、应用心理学等方向。核心课程包括普通心理学、实验心理学、发展心理学、社会心理学、心理统计、心理测量等。毕业生可在教育、医疗、企业、咨询等领域从事心理咨询、人力资源、市场研究、用户体验等工作，随着心理健康关注度提高，该专业需求增长。',
  },
  // 工科新增15个专业
  {
    id: 'env-eng',
    name: '环境工程',
    category: 'engineering',
    hotScore: 77,
    strongUniversities: ['tsinghua', 'tongji', 'hhu', 'scut', 'hit', 'sjtu', 'nju'],
    description:
      '环境工程专业主要研究环境污染防治、环境质量改善、废物处理与资源化利用等理论与技术。核心课程包括环境工程原理、水污染控制工程、大气污染控制工程、固体废物处理与处置、环境监测、环境评价等。毕业生可在环保部门、设计院、环保企业、科研院所从事环境工程设计、环境监测、污染治理、环境管理等工作，随着环保意识的提高，该专业需求持续增长。',
  },
  {
    id: 'energy-power',
    name: '能源与动力工程',
    category: 'engineering',
    hotScore: 78,
    strongUniversities: ['tsinghua', 'sjtu', 'xju', 'hit', 'hust', 'scut', 'tju'],
    description:
      '能源与动力工程专业主要研究能源转换、利用与管理，涉及热能工程、动力机械、新能源技术等方向。核心课程包括工程热力学、传热学、流体力学、燃烧学、汽轮机原理、锅炉原理等。毕业生可在电力、能源、机械、汽车等行业从事能源系统设计、动力设备研发、新能源技术开发等工作，是能源行业的重要专业。',
  },
  {
    id: 'aerospace',
    name: '航空航天工程',
    category: 'engineering',
    hotScore: 83,
    strongUniversities: ['buaa', 'nuaa', 'nwpu', 'hit', 'tsinghua', 'sjtu', 'hust'],
    description:
      '航空航天工程专业主要研究飞行器设计、制造、运行与控制，包括飞机工程、航天器工程、推进系统等方向。核心课程包括飞行器设计、空气动力学、飞行器结构力学、飞行器制造工艺、飞行器控制系统等。毕业生可在航空航天院所、航空公司、国防工业从事飞行器设计、制造、测试、维护等工作，是国家战略需求的重要专业。',
  },
  {
    id: 'nuclear',
    name: '核工程与核技术',
    category: 'engineering',
    hotScore: 70,
    strongUniversities: ['tsinghua', 'hit', 'sjtu', 'cqu', 'scut'],
    description:
      '核工程与核技术专业主要研究核能利用、核技术应用、核安全等方面的理论与技术。核心课程包括核物理、反应堆物理、核反应堆工程、辐射防护、核安全等。毕业生可在核电站、核工业部门、科研院所、医疗设备公司从事核工程设计、运行管理、辐射防护、核技术应用等工作，是核能行业的核心专业。',
  },
  {
    id: 'optics',
    name: '光电信息科学与工程',
    category: 'engineering',
    hotScore: 79,
    strongUniversities: ['hit', 'zju', 'tsinghua', 'seu', 'xatu', 'sjtu'],
    description:
      '光电信息科学与工程专业是光学、电子、信息科学交叉的新兴专业，主要研究光电信息获取、传输、处理与应用。核心课程包括物理光学、应用光学、激光原理与技术、光电检测技术、光通信技术、光电子器件等。毕业生可在光通信、激光技术、光电子、光学仪器等领域从事研发、设计、制造等工作，是光电子产业的重要专业。',
  },
  {
    id: 'vehicle',
    name: '车辆工程',
    category: 'engineering',
    hotScore: 81,
    strongUniversities: ['tsinghua', 'jlu', 'hit', 'sjtu', 'scut', 'hust', 'cqu'],
    description:
      '车辆工程专业主要研究汽车、摩托车等机动车辆的设计、制造、测试与维护。核心课程包括汽车构造、汽车理论、汽车设计、汽车制造工艺、发动机原理、汽车电子技术等。毕业生可在汽车制造企业、汽车零部件企业、汽车研究院所从事车辆设计、制造、测试、管理等工作，随着新能源汽车的发展，该专业前景广阔。',
  },
  {
    id: 'ship',
    name: '船舶与海洋工程',
    category: 'engineering',
    hotScore: 73,
    strongUniversities: ['sjtu', 'hit', 'dlut', 'tju', 'scut'],
    description:
      '船舶与海洋工程专业主要研究船舶设计、制造、海洋平台建设等理论与技术。核心课程包括船舶静力学、船舶动力学、船舶结构力学、船舶设计原理、海洋工程等。毕业生可在船舶制造企业、海洋工程公司、设计院、船级社从事船舶设计、制造、检验、管理等工作，是国家海洋战略的重要支撑专业。',
  },
  {
    id: 'food-eng',
    name: '食品科学与工程',
    category: 'engineering',
    hotScore: 74,
    strongUniversities: ['cau', 'scut', 'jiangnan', 'zju', 'nwafu', 'sysu'],
    description:
      '食品科学与工程专业主要研究食品的加工、贮藏、安全检测与质量控制。核心课程包括食品化学、食品微生物学、食品工艺学、食品营养学、食品安全、食品分析等。毕业生可在食品企业、质检部门、科研院所从事食品研发、质量控制、食品安全检测、生产管理等工作，是食品行业的重要专业。',
  },
  {
    id: 'textile',
    name: '纺织工程',
    category: 'engineering',
    hotScore: 68,
    strongUniversities: ['scut', 'suda', 'tianjin-poly', 'xpu', 'donghua'],
    description:
      '纺织工程专业主要研究纺织材料、纺织工艺、纺织品设计等方面的理论与技术。核心课程包括纺织材料学、纺纱学、织造学、染整工艺、纺织品设计、纺织品检测等。毕业生可在纺织企业、服装企业、质检部门从事纺织工艺设计、产品开发、质量控制等工作，是传统制造业的重要专业。',
  },
  {
    id: 'mining',
    name: '采矿工程',
    category: 'engineering',
    hotScore: 65,
    strongUniversities: ['csu', 'cqu', 'xust', 'ustb', 'cumt'],
    description:
      '采矿工程专业主要研究矿产资源开采的理论、方法与技术，包括金属矿、非金属矿、煤炭等的开采。核心课程包括采矿学、矿山压力与岩层控制、矿井通风、矿山安全、采矿机械等。毕业生可在矿山企业、设计院、科研院所从事采矿设计、生产管理、安全监测等工作，是矿业的重要专业。',
  },
  {
    id: 'petroleum',
    name: '石油工程',
    category: 'engineering',
    hotScore: 71,
    strongUniversities: ['cup', 'cupw', 'swpu', 'nepu'],
    description:
      '石油工程专业主要研究石油与天然气的勘探、开发、生产与管理。核心课程包括油藏工程、钻井工程、采油工程、油层物理、石油地质学等。毕业生可在石油公司、油田企业、设计院从事石油勘探开发、钻井采油、油气田管理等工作，是能源行业的重要专业。',
  },
  {
    id: 'transport',
    name: '交通运输',
    category: 'engineering',
    hotScore: 76,
    strongUniversities: ['tongji', 'swjtu', 'chd', 'seu', 'bjtu', 'dlufl'],
    description:
      '交通运输专业主要研究交通运输系统的规划、设计、运营与管理，包括道路、铁路、航空、水路等运输方式。核心课程包括交通运输规划、交通工程、运输组织学、交通管理与控制、物流工程等。毕业生可在交通部门、物流企业、设计院从事交通规划、运输管理、物流运作等工作，是交通运输行业的重要专业。',
  },
  {
    id: 'water-conservancy',
    name: '水利水电工程',
    category: 'engineering',
    hotScore: 72,
    strongUniversities: ['hhu', 'tsinghua', 'wuhan', 'sichuan', 'tianjin'],
    description:
      '水利水电工程专业主要研究水资源的开发利用、水电站建设、水利工程建设等方面的理论与技术。核心课程包括水力学、水文学、水工建筑物、水电站、水利工程施工等。毕业生可在水利部门、水电企业、设计院从事水利工程设计、施工管理、运行维护等工作，是国家基础设施建设的重要专业。',
  },
  {
    id: 'printing',
    name: '印刷工程',
    category: 'engineering',
    hotScore: 62,
    strongUniversities: ['bjfu', 'scut', 'tianjin-science', 'hunan'],
    description:
      '印刷工程专业主要研究印刷技术、印刷材料、印刷设备等方面的理论与应用。核心课程包括印刷原理与工艺、印刷材料学、印刷设备、色彩学、图像处理等。毕业生可在印刷企业、出版社、广告公司从事印刷工艺设计、质量控制、设备管理等工作，是文化传媒行业的重要专业。',
  },
  {
    id: 'packaging',
    name: '包装工程',
    category: 'engineering',
    hotScore: 64,
    strongUniversities: ['scut', 'tianjin-tech', 'jiangnan', 'bjfu'],
    description:
      '包装工程专业主要研究包装材料、包装设计、包装工艺等方面的理论与技术。核心课程包括包装材料学、包装结构设计、包装工艺学、包装机械、包装测试等。毕业生可在包装企业、物流企业、食品企业从事包装设计、包装工艺、包装材料研发等工作，是现代物流和商品流通的重要专业。',
  },
  // 理科新增15个专业
  {
    id: 'applied-chem',
    name: '应用化学',
    category: 'science',
    hotScore: 71,
    strongUniversities: ['pku', 'nju', 'fudan', 'ustc', 'zju', 'sdu', 'nankai'],
    description:
      '应用化学专业在化学基础上，注重化学原理在实际生产中的应用，包括精细化工、材料化学、环境化学等方向。核心课程包括无机化学、有机化学、物理化学、分析化学、化工原理、精细化学品化学等。毕业生可在化工、材料、制药、环保等行业从事研发、分析检测、工艺设计等工作，是连接化学理论与应用的重要专业。',
  },
  {
    id: 'biotechnology',
    name: '生物技术',
    category: 'science',
    hotScore: 75,
    strongUniversities: ['pku', 'tsinghua', 'fudan', 'zju', 'sysu', 'scu', 'ccnu'],
    description:
      '生物技术专业主要研究利用生物体或其组成部分进行产品开发和技术应用，包括基因工程、细胞工程、发酵工程、酶工程等。核心课程包括生物化学、分子生物学、细胞生物学、微生物学、基因工程、发酵工程等。毕业生可在生物技术公司、制药企业、科研院所从事生物技术研发、产品开发、技术应用等工作，是生物产业的重要基础专业。',
  },
  {
    id: 'geology',
    name: '地质学',
    category: 'science',
    hotScore: 69,
    strongUniversities: ['cugb', 'cug', 'jilin', 'nwpu', 'pku', 'nju'],
    description:
      '地质学专业主要研究地球的物质组成、结构构造、演化历史及地质作用过程。核心课程包括普通地质学、矿物学、岩石学、构造地质学、古生物学、地球化学等。毕业生可在地质部门、矿业企业、科研院所从事地质调查、矿产勘查、环境地质等工作，是资源勘查和环境保护的重要专业。',
  },
  {
    id: 'geophysics',
    name: '地球物理学',
    category: 'science',
    hotScore: 67,
    strongUniversities: ['pku', 'ustc', 'cugb', 'cug', 'tongji'],
    description:
      '地球物理学专业主要研究地球的物理性质、物理过程和物理现象，包括地震学、重力学、地磁学、地电学等。核心课程包括地球物理学基础、地震学、重力学、地磁学、地电学、地球物理勘探等。毕业生可在石油、矿产、地震等部门从事地球物理勘探、地震监测、地质灾害评估等工作，是资源勘查和防灾减灾的重要专业。',
  },
  {
    id: 'atmospheric',
    name: '大气科学',
    category: 'science',
    hotScore: 68,
    strongUniversities: ['nju', 'lzu', 'pku', 'nudt', 'cams'],
    description:
      '大气科学专业主要研究大气的物理、化学和动力过程，包括天气学、气候学、大气物理学、大气化学等。核心课程包括大气物理学、天气学、气候学、动力气象学、大气化学、数值天气预报等。毕业生可在气象部门、环保部门、航空部门从事天气预报、气候分析、大气环境监测等工作，是气象和环境科学的重要专业。',
  },
  {
    id: 'oceanography',
    name: '海洋科学',
    category: 'science',
    hotScore: 70,
    strongUniversities: ['ouc', 'xmu', 'tju', 'hhu', 'tongji'],
    description:
      '海洋科学专业主要研究海洋的物理、化学、生物和地质过程，包括物理海洋学、化学海洋学、生物海洋学、海洋地质学等。核心课程包括海洋学导论、物理海洋学、化学海洋学、生物海洋学、海洋地质学等。毕业生可在海洋部门、科研院所、海洋企业从事海洋调查、海洋资源开发、海洋环境保护等工作，是国家海洋战略的重要支撑专业。',
  },
  {
    id: 'ecology',
    name: '生态学',
    category: 'science',
    hotScore: 72,
    strongUniversities: ['pku', 'sysu', 'xmu', 'lzu', 'ecnu', 'nwafu'],
    description:
      '生态学专业主要研究生物与环境之间的相互关系，包括个体生态学、种群生态学、群落生态学、生态系统生态学等。核心课程包括普通生态学、植物生态学、动物生态学、生态系统生态学、景观生态学、保护生物学等。毕业生可在环保部门、科研院所、自然保护区从事生态调查、生态修复、环境保护等工作，是生态文明建设的重要专业。',
  },
  {
    id: 'geography',
    name: '地理科学',
    category: 'science',
    hotScore: 73,
    strongUniversities: ['pku', 'nju', 'bnu', 'ecnu', 'lzu', 'ccnu'],
    description:
      '地理科学专业主要研究地球表层系统的自然和人文要素及其相互作用，包括自然地理学、人文地理学、地理信息科学等。核心课程包括自然地理学、人文地理学、地理信息系统、遥感原理与应用、区域地理等。毕业生可在规划部门、国土部门、环境部门、科研院所从事地理调查、区域规划、地理信息系统应用等工作，是区域发展和规划的重要专业。',
  },
  {
    id: 'astronomy',
    name: '天文学',
    category: 'science',
    hotScore: 66,
    strongUniversities: ['nju', 'pku', 'ustc', 'tsinghua'],
    description:
      '天文学专业主要研究天体的结构、演化和运动规律，包括天体物理、天体测量、天体力学等。核心课程包括普通天文学、天体物理学、天体测量学、天体力学、恒星物理、星系物理等。毕业生可在天文台、科研院所、高校从事天文观测、天体物理研究、天文科普等工作，是基础科学的重要分支。',
  },
  {
    id: 'psychology-sci',
    name: '应用心理学',
    category: 'science',
    hotScore: 77,
    strongUniversities: ['bnu', 'ecnu', 'hustc', 'pku', 'ruc', 'swu'],
    description:
      '应用心理学专业在心理学基础上，注重心理学理论在实际领域的应用，包括教育心理学、临床心理学、管理心理学、工程心理学等。核心课程包括普通心理学、实验心理学、心理统计、心理测量、心理咨询、心理治疗等。毕业生可在教育、医疗、企业、咨询等领域从事心理咨询、心理评估、人力资源管理、用户体验设计等工作。',
  },
  {
    id: 'theoretical-physics',
    name: '理论物理',
    category: 'science',
    hotScore: 70,
    strongUniversities: ['pku', 'tsinghua', 'ustc', 'nju', 'zju'],
    description:
      '理论物理专业主要研究物质的基本结构和运动规律，包括量子力学、统计物理、场论、粒子物理、凝聚态物理等。核心课程包括理论力学、量子力学、统计力学、电动力学、固体物理、粒子物理等。毕业生主要在高校和科研院所从事基础理论研究，也可以转向应用领域从事研发工作，是物理学科的核心专业。',
  },
  {
    id: 'applied-math',
    name: '应用数学',
    category: 'science',
    hotScore: 79,
    strongUniversities: ['pku', 'tsinghua', 'zju', 'nju', 'ustc', 'ruc'],
    description:
      '应用数学专业在数学基础上，注重数学方法在实际问题中的应用，包括计算数学、概率统计、运筹学、金融数学等。核心课程包括数学分析、高等代数、概率论、数理统计、数值分析、运筹学等。毕业生可在金融、保险、互联网、科研院所从事数学建模、数据分析、算法研究等工作，是应用面很广的专业。',
  },
  {
    id: 'bioinformatics',
    name: '生物信息学',
    category: 'science',
    hotScore: 78,
    strongUniversities: ['pku', 'tsinghua', 'fudan', 'zju', 'sysu', 'scu'],
    description:
      '生物信息学专业是生物学、计算机科学和数学交叉的新兴专业，主要研究生物大数据的处理、分析和应用。核心课程包括生物学、计算机科学、数据结构与算法、生物信息学算法、基因组学、蛋白质组学等。毕业生可在生物技术公司、制药企业、科研院所从事生物数据分析、基因序列分析、药物设计等工作，是生命科学研究的重要工具专业。',
  },
  {
    id: 'geography-info',
    name: '地理信息科学',
    category: 'science',
    hotScore: 76,
    strongUniversities: ['pku', 'nju', 'wuhan', 'tongji', 'ecnu'],
    description:
      '地理信息科学专业主要研究地理信息的获取、存储、处理、分析和应用，包括地理信息系统、遥感技术、全球定位系统等。核心课程包括地理信息系统原理、遥感原理与应用、GPS原理与应用、空间数据库、数字图像处理等。毕业生可在国土、规划、环境、测绘等部门从事地理信息系统开发、遥感应用、空间数据分析等工作，是地理信息技术应用的重要专业。',
  },
  {
    id: 'materials-physics',
    name: '材料物理',
    category: 'science',
    hotScore: 74,
    strongUniversities: ['pku', 'ustc', 'tsinghua', 'nju', 'fudan'],
    description:
      '材料物理专业主要研究材料的物理性质和物理过程，包括材料的电子结构、磁性、光学性质、相变等。核心课程包括固体物理、材料物理、材料科学基础、材料表征技术、材料物理性能等。毕业生可在材料企业、科研院所从事材料研究、性能测试、新材料开发等工作，是材料科学的重要基础专业。',
  },
  // 文科新增10个专业
  {
    id: 'history',
    name: '历史学',
    category: 'arts',
    hotScore: 75,
    strongUniversities: ['pku', 'nju', 'fudan', 'nku', 'bnu', 'whu', 'ecnu'],
    description:
      '历史学专业主要研究人类社会的历史发展过程，包括中国史、世界史、考古学等方向。核心课程包括中国古代史、中国近现代史、世界古代史、世界近现代史、史学理论、史学方法等。毕业生可在高校、中学、科研院所、博物馆、档案馆从事历史教学、历史研究、文物管理等工作，也可以从事编辑、记者、公务员等工作。',
  },
  {
    id: 'philosophy',
    name: '哲学',
    category: 'arts',
    hotScore: 71,
    strongUniversities: ['pku', 'fudan', 'nju', 'ruc', 'zju', 'whu'],
    description:
      '哲学专业主要研究世界观、方法论、认识论等基本哲学问题，包括马克思主义哲学、中国哲学、西方哲学、逻辑学等。核心课程包括马克思主义哲学原理、中国哲学史、西方哲学史、逻辑学、伦理学、美学等。毕业生可在高校、科研院所从事哲学教学和研究，也可以从事编辑、公务员、企业管理等工作，是培养思辨能力和理论素养的重要专业。',
  },
  {
    id: 'sociology',
    name: '社会学',
    category: 'arts',
    hotScore: 76,
    strongUniversities: ['ruc', 'pku', 'fudan', 'nju', 'whu', 'ecnu'],
    description:
      '社会学专业主要研究社会结构、社会关系、社会变迁等社会现象和规律。核心课程包括社会学概论、社会研究方法、社会统计学、社会心理学、社会分层、社会变迁等。毕业生可在政府部门、社会组织、企业、科研院所从事社会调查、社会政策研究、社会服务、市场研究等工作，是理解社会的重要专业。',
  },
  {
    id: 'politics',
    name: '政治学与行政学',
    category: 'arts',
    hotScore: 74,
    strongUniversities: ['ruc', 'pku', 'fudan', 'nju', 'nku', 'whu'],
    description:
      '政治学与行政学专业主要研究政治现象、政治制度、公共行政等理论和实践问题。核心课程包括政治学原理、中国政治制度史、比较政治制度、公共行政学、公共政策学等。毕业生可在政府部门、事业单位、企业从事行政管理、政策研究、公共事务管理等工作，也可以从事教学和研究工作，是培养公共管理人才的重要专业。',
  },
  {
    id: 'international-relations',
    name: '国际关系',
    category: 'arts',
    hotScore: 77,
    strongUniversities: ['fudan', 'pku', 'ruc', 'tsinghua', 'nku'],
    description:
      '国际关系专业主要研究国家间关系、国际组织、国际法、外交政策等国际事务。核心课程包括国际关系理论、国际关系史、国际政治经济学、外交学、国际法等。毕业生可在外交部门、国际组织、涉外企业、高校从事外交、国际交流、国际事务研究等工作，是培养国际化人才的重要专业。',
  },
  {
    id: 'education',
    name: '教育学',
    category: 'arts',
    hotScore: 81,
    strongUniversities: ['bnu', 'ecnu', 'hustc', 'snnu', 'nwnu', 'swu'],
    description:
      '教育学专业主要研究教育现象、教育规律、教育方法等教育理论和实践问题。核心课程包括教育学原理、教育心理学、中外教育史、课程与教学论、教育研究方法等。毕业生可在高校、中小学、教育行政部门、教育研究机构从事教育管理、教学、教育研究等工作，是培养教育人才的基础专业。',
  },
  {
    id: 'chinese-education',
    name: '汉语国际教育',
    category: 'arts',
    hotScore: 78,
    strongUniversities: ['bfsu', 'bnu', 'ecnu', 'fudan', 'nju', 'xisu'],
    description:
      '汉语国际教育专业主要培养对外汉语教学人才，研究汉语作为第二语言的教学理论和方法。核心课程包括现代汉语、古代汉语、语言学概论、对外汉语教学概论、跨文化交际、中国文化等。毕业生可在国内外从事对外汉语教学、文化交流、国际教育等工作，随着汉语国际推广，该专业需求持续增长。',
  },
  {
    id: 'japanese',
    name: '日语',
    category: 'arts',
    hotScore: 72,
    strongUniversities: ['bfsu', 'dlufl', 'shisu', 'xisu', 'nju', 'fudan'],
    description:
      '日语专业主要研究日语语言、文学、文化，培养具备日语听说读写译能力的人才。核心课程包括基础日语、高级日语、日语阅读、日语写作、翻译理论与实践、日本文学、日本文化等。毕业生可在教育、外贸、翻译、旅游、日企等领域从事日语教学、翻译、外贸业务、国际交流等工作。',
  },
  {
    id: 'advertising',
    name: '广告学',
    category: 'arts',
    hotScore: 80,
    strongUniversities: ['cuc', 'fudan', 'ruc', 'xmu', 'sysu', 'whu'],
    description:
      '广告学专业主要研究广告理论、广告策划、广告创意、广告设计等广告理论和实践。核心课程包括广告学概论、广告策划、广告创意、广告文案写作、广告设计、市场营销等。毕业生可在广告公司、媒体、企业营销部门从事广告策划、创意设计、品牌传播、市场营销等工作，是现代营销传播的重要专业。',
  },
  {
    id: 'tourism',
    name: '旅游管理',
    category: 'arts',
    hotScore: 73,
    strongUniversities: ['zju', 'nku', 'dongbei', 'beijing', 'shanghai', 'xmu'],
    description:
      '旅游管理专业主要研究旅游业的发展规律、旅游企业管理、旅游规划与开发等。核心课程包括旅游学概论、旅游经济学、旅游规划与开发、酒店管理、旅行社管理、旅游市场营销等。毕业生可在旅游企业、酒店、景区、旅游行政部门从事旅游规划、旅游管理、旅游营销、酒店管理等工作，是旅游产业的重要专业。',
  },
  // 医科专业
  {
    id: 'clinical-medicine',
    name: '临床医学',
    category: 'medicine',
    hotScore: 96,
    strongUniversities: ['pku', 'sjtu', 'zju', 'fudan', 'cmu', 'scu', 'afmu'],
    description: '临床医学专业是培养临床医生的核心专业，主要学习人体解剖学、生理学、病理学、药理学、诊断学、内科学、外科学、妇产科学、儿科学等基础医学和临床医学知识。学生需要掌握疾病的诊断、治疗和预防方法，具备良好的医德医风和临床技能。毕业后可从事临床医生、医学研究、医学教育等工作，是医学领域最核心、需求量最大的专业之一。',
  },
  {
    id: 'stomatology',
    name: '口腔医学',
    category: 'medicine',
    hotScore: 88,
    strongUniversities: ['pku', 'sjtu', 'scu', 'cmu', 'afmu'],
    description: '口腔医学专业主要研究口腔及颌面部疾病的诊断、治疗和预防，涵盖口腔内科、口腔外科、口腔修复、口腔正畸、口腔预防保健等领域。核心课程包括口腔解剖生理学、口腔病理学、牙体牙髓病学、牙周病学、口腔颌面外科学等。毕业生可从事口腔医生、口腔医学研究等工作，随着人们对口腔健康重视程度的提高，就业前景良好。',
  },
  {
    id: 'preventive-medicine',
    name: '预防医学',
    category: 'medicine',
    hotScore: 82,
    strongUniversities: ['pku', 'fudan', 'sjtu', 'zju', 'cmu', 'scu'],
    description: '预防医学专业主要研究疾病的发生规律和预防措施，包括流行病学、卫生统计学、环境卫生学、营养与食品卫生学、职业卫生与职业病学等方向。该专业注重疾病预防和健康促进，培养能在疾病预防控制中心、卫生监督所、医院等机构从事疾病预防、卫生监督、健康管理等工作的人才。',
  },
  {
    id: 'traditional-chinese-medicine',
    name: '中医学',
    category: 'medicine',
    hotScore: 85,
    strongUniversities: ['pku', 'sjtu', 'zju', 'fudan', 'scu'],
    description: '中医学专业传承和发展中医理论和诊疗技术，学习中医基础理论、中医诊断学、中药学、方剂学、中医内科学、中医外科学、针灸推拿学等内容。该专业强调整体观念和辨证论治，培养能够运用中医药理论和方法诊疗疾病的中医医生。毕业生可在中医院、综合医院中医科、中医药科研院所等单位工作。',
  },
  {
    id: 'integrated-chinese-western-medicine',
    name: '中西医临床医学',
    category: 'medicine',
    hotScore: 83,
    strongUniversities: ['pku', 'sjtu', 'zju', 'scu'],
    description: '中西医临床医学专业结合中医和西医的理论与方法，培养既掌握现代医学知识，又具备中医诊疗技能的复合型医学人才。主要学习中医基础理论、西医基础理论、中西医诊断学、中西医内科学、中西医外科学等课程。毕业生可在医疗机构从事中西医结合诊疗工作，特别适合在基层医疗机构发挥综合优势。',
  },
  {
    id: 'pediatrics',
    name: '儿科学',
    category: 'medicine',
    hotScore: 89,
    strongUniversities: ['pku', 'fudan', 'sjtu', 'zju', 'cmu', 'scu'],
    description: '儿科学专业专门研究儿童疾病的诊断、治疗和预防，涵盖新生儿、婴幼儿、儿童和青少年各阶段的生长发育特点和疾病规律。主要课程包括儿科学基础、小儿内科学、小儿外科学、小儿传染病学、儿童保健学等。随着国家对儿童健康的高度重视和全面二孩、三孩政策的实施，儿科医生的需求量持续增加，就业前景广阔。',
  },
  {
    id: 'anesthesiology',
    name: '麻醉学',
    category: 'medicine',
    hotScore: 87,
    strongUniversities: ['pku', 'sjtu', 'zju', 'cmu', 'afmu'],
    description: '麻醉学专业主要研究围手术期的麻醉管理和疼痛治疗，包括临床麻醉、重症医学、疼痛诊疗等方向。核心课程包括麻醉生理学、麻醉药理学、临床麻醉学、危重病医学、疼痛诊疗学等。麻醉医生是外科手术不可或缺的重要角色，随着手术量的增加，麻醉医生的需求量大，工作强度高但收入相对较高。',
  },
  {
    id: 'medical-imaging',
    name: '医学影像学',
    category: 'medicine',
    hotScore: 84,
    strongUniversities: ['pku', 'sjtu', 'zju', 'fudan', 'cmu', 'scu'],
    description: '医学影像学专业主要研究利用各种医学影像技术（X线、CT、MRI、超声、核医学等）进行疾病的诊断，是现代医学诊断的重要手段。主要课程包括医学影像设备学、医学影像检查技术、影像诊断学、介入放射学等。随着医学影像技术的不断发展，该专业的应用范围越来越广，就业前景良好，工作环境相对舒适。',
  },
  {
    id: 'rehabilitation-medicine',
    name: '康复治疗学',
    category: 'medicine',
    hotScore: 80,
    strongUniversities: ['sjtu', 'zju', 'cmu', 'scu'],
    description: '康复治疗学专业主要研究功能障碍的评估、治疗和康复，包括物理治疗、作业治疗、言语治疗等方向。核心课程包括康复医学概论、康复评定学、物理治疗学、作业治疗学、言语治疗学、康复工程学等。随着人口老龄化和人们对生活质量要求的提高，康复医疗的需求持续增长，该专业就业前景良好。',
  },
  {
    id: 'nursing',
    name: '护理学',
    category: 'medicine',
    hotScore: 86,
    strongUniversities: ['pku', 'fudan', 'sjtu', 'zju', 'cmu', 'scu'],
    description: '护理学专业培养能够在医疗机构、社区、家庭等场所从事临床护理、护理管理、护理教育和护理科研的高级护理人才。主要学习基础医学、护理学基础、内科护理学、外科护理学、妇产科护理学、儿科护理学、护理管理学等课程。护理人员是医疗团队的重要组成部分，随着医疗事业的发展，护理专业的需求量大，就业稳定。',
  },
  {
    id: 'pharmacy',
    name: '药学',
    category: 'medicine',
    hotScore: 91,
    strongUniversities: ['pku', 'sjtu', 'zju', 'fudan', 'cmu', 'scu'],
    description: '药学专业主要研究药物的发现、开发、生产、管理和临床应用，包括药物化学、药理学、药剂学、药物分析、临床药学等方向。核心课程包括有机化学、药物化学、药理学、药剂学、药物分析、药事管理学等。毕业生可在医院、制药企业、药品监管部门、科研院所等单位从事药品研发、生产、管理、临床药学等工作。',
  },
  {
    id: 'pharmaceutical-engineering',
    name: '制药工程',
    category: 'medicine',
    hotScore: 83,
    strongUniversities: ['tsinghua', 'sjtu', 'zju', 'scut', 'tju'],
    description: '制药工程专业是药学与工程学交叉的专业，主要研究药品的工业化生产技术和工艺，包括药物合成、药物制剂、药品质量控制、制药设备等内容。主要课程包括有机化学、药物化学、药剂学、制药工艺学、制药设备与工程设计、药品生产质量管理等。毕业生可在制药企业、医药工程设计单位从事药品生产工艺设计、生产管理、质量控制等工作。',
  },
  {
    id: 'clinical-pharmacy',
    name: '临床药学',
    category: 'medicine',
    hotScore: 85,
    strongUniversities: ['pku', 'sjtu', 'zju', 'fudan', 'cmu'],
    description: '临床药学专业培养能够在医疗机构从事临床药学服务、药物临床应用、用药监护和用药指导的专门人才。主要学习基础医学、临床医学、药理学、临床药理学、临床药物治疗学、药事管理学等课程。临床药师是医疗团队的重要成员，负责参与临床用药决策、监测药物疗效和不良反应、提供用药咨询等服务。',
  },
  {
    id: 'public-health',
    name: '公共卫生',
    category: 'medicine',
    hotScore: 81,
    strongUniversities: ['pku', 'fudan', 'sjtu', 'zju', 'cmu'],
    description: '公共卫生专业主要研究人群健康和疾病预防控制，包括流行病学、卫生统计学、环境卫生学、职业卫生学、营养与食品卫生学、卫生事业管理学等方向。主要课程包括流行病学、卫生统计学、环境卫生学、职业卫生与职业病学、营养与食品卫生学、卫生事业管理学等。毕业生可在疾病预防控制中心、卫生监督所、医院、卫生行政部门等单位工作，在疫情防控中发挥重要作用。',
  },
  {
    id: 'biomedical-engineering',
    name: '生物医学工程',
    category: 'medicine',
    hotScore: 88,
    strongUniversities: ['tsinghua', 'sjtu', 'zju', 'ustc', 'scut', 'hit'],
    description: '生物医学工程专业是工程学与医学的交叉学科，主要研究运用工程技术和原理解决医学问题，包括生物医学信号处理、医学影像技术、生物材料、医学仪器、康复工程等方向。核心课程包括生物医学信号处理、医学影像技术、生物材料学、医学仪器原理、康复工程学等。毕业生可在医疗器械企业、医院、科研院所从事医疗设备研发、医学影像技术、生物材料开发等工作。',
  },
  // 工科新增5个专业
  {
    id: 'aerospace-engineering',
    name: '航空航天工程',
    category: 'engineering',
    hotScore: 86,
    strongUniversities: ['nwpu', 'beihang', 'nudt', 'hit', 'sjtu', 'tsinghua'],
    description: '航空航天工程专业主要研究飞机、航天器、导弹等飞行器的设计、制造、测试与运行，包括飞行器设计、推进系统、材料与结构、飞行控制等方向。核心课程包括空气动力学、飞行器结构设计、推进原理、飞行器控制系统、飞行力学等。毕业生可在航空航天企业、科研院所、国防部门从事飞行器设计、制造、测试、维护等工作，是航空航天产业的核心专业。',
  },
  {
    id: 'nuclear-engineering',
    name: '核工程与核技术',
    category: 'engineering',
    hotScore: 79,
    strongUniversities: ['tsinghua', 'hit', 'xju', 'scu', 'swust'],
    description: '核工程与核技术专业主要研究核能利用、核反应堆工程、核技术应用等方面，包括核反应堆物理、核反应堆工程、辐射防护、核材料等方向。核心课程包括核反应堆物理、核反应堆工程、核电子学、辐射防护、核材料学等。毕业生可在核电站、核研究院所、核技术应用企业从事核能开发、核技术应用、辐射防护等工作，随着清洁能源需求增长，该专业前景看好。',
  },
  {
    id: 'environmental-engineering',
    name: '环境工程',
    category: 'engineering',
    hotScore: 83,
    strongUniversities: ['tongji', 'tsinghua', 'pku', 'hit', 'nju', 'scut'],
    description: '环境工程专业主要研究环境污染防治、环境治理技术、环境监测与评价等，包括水污染控制、大气污染控制、固体废物处理、环境监测等方向。核心课程包括环境工程原理、水污染控制工程、大气污染控制工程、固体废物处理与处置、环境监测等。毕业生可在环保部门、环保企业、设计院、科研院所从事环境工程设计、环境监测、环境管理等工作，是环境保护的重要专业。',
  },
  {
    id: 'food-science',
    name: '食品科学与工程',
    category: 'engineering',
    hotScore: 78,
    strongUniversities: ['jiangnan', 'scut', 'zju', 'suda', 'whu', 'nwafu'],
    description: '食品科学与工程专业主要研究食品的加工、贮藏、安全、营养等方面的理论与技术，包括食品工艺、食品化学、食品微生物、食品安全等方向。核心课程包括食品化学、食品微生物学、食品工艺学、食品分析、食品安全学等。毕业生可在食品企业、质检部门、科研院所从事食品研发、质量控制、食品检测、食品安全管理等工作，是食品产业的重要专业。',
  },
  {
    id: 'optical-engineering',
    name: '光电信息科学与工程',
    category: 'engineering',
    hotScore: 84,
    strongUniversities: ['zju', 'tsinghua', 'hit', 'xju', 'uestc', 'scut'],
    description: '光电信息科学与工程专业主要研究光电子技术、光电信息处理、光学系统设计等方面，包括激光技术、光通信、光电子器件、光电检测等方向。核心课程包括物理光学、应用光学、激光原理与技术、光电子技术、光电检测技术等。毕业生可在光电企业、通信企业、科研院所从事光电器件研发、光通信系统设计、光电检测等工作，是光电子产业的重要专业。',
  },
  // 理科新增5个专业
  {
    id: 'applied-statistics',
    name: '应用统计学',
    category: 'science',
    hotScore: 82,
    strongUniversities: ['ruc', 'xmu', 'ecnu', 'swufe', 'cufe', 'nwnu'],
    description: '应用统计学专业注重统计学方法在实际领域的应用，包括经济统计、生物统计、社会统计、金融统计等方向。核心课程包括概率论、数理统计、应用回归分析、时间序列分析、多元统计分析、统计软件应用等。毕业生可在金融、保险、市场研究、医疗、政府部门从事数据分析、统计建模、风险评估等工作，应用面广、就业前景好。',
  },
  {
    id: 'quantum-physics',
    name: '量子物理',
    category: 'science',
    hotScore: 68,
    strongUniversities: ['pku', 'tsinghua', 'ustc', 'nju', 'zju'],
    description: '量子物理专业深入研究量子力学的基本原理和前沿应用，包括量子信息、量子计算、量子光学、量子场论等方向。核心课程包括量子力学、量子统计、量子场论、量子信息、量子计算等。毕业生主要在高校和科研院所从事量子物理理论研究，也可以转向量子技术应用领域，是前沿基础科学的重要分支。',
  },
  {
    id: 'computational-biology',
    name: '计算生物学',
    category: 'science',
    hotScore: 75,
    strongUniversities: ['pku', 'tsinghua', 'fudan', 'zju', 'sysu', 'scu'],
    description: '计算生物学专业是生物学、计算机科学和数学交叉的新兴专业，主要研究运用计算方法和数学模型解决生物学问题。核心课程包括生物学、计算机科学、数据结构与算法、生物信息学、计算生物学算法、系统生物学等。毕业生可在生物技术公司、制药企业、科研院所从事生物数据分析、蛋白质结构预测、药物设计等工作，是生命科学研究的重要工具专业。',
  },
  {
    id: 'earth-system-science',
    name: '地球系统科学',
    category: 'science',
    hotScore: 71,
    strongUniversities: ['pku', 'nju', 'cugb', 'cug', 'tongji'],
    description: '地球系统科学专业从整体角度研究地球系统各圈层（大气圈、水圈、岩石圈、生物圈）的相互作用和演化，包括全球变化、地球系统模拟、环境科学等方向。核心课程包括地球系统科学导论、大气科学、海洋科学、地球化学、生态学、全球变化等。毕业生可在气象、海洋、环境、科研院所从事地球系统研究、环境监测、全球变化分析等工作，是应对气候变化的重要专业。',
  },
  {
    id: 'complex-systems',
    name: '复杂系统科学',
    category: 'science',
    hotScore: 69,
    strongUniversities: ['pku', 'tsinghua', 'ustc', 'nju', 'zju'],
    description: '复杂系统科学专业研究复杂系统的结构、行为和演化规律，包括系统动力学、网络科学、混沌理论、自组织理论等方向。核心课程包括系统科学基础、复杂网络理论、非线性动力学、自组织理论、系统建模与仿真等。毕业生可在科研院所、高校从事复杂系统理论研究，也可以转向金融、管理、社会等领域从事系统分析工作，是交叉学科的前沿专业。',
  },
  // 文科新增5个专业
  {
    id: 'cultural-heritage',
    name: '文物与博物馆学',
    category: 'arts',
    hotScore: 72,
    strongUniversities: ['pku', 'fudan', 'nju', 'jlu', 'bnu', 'nku'],
    description: '文物与博物馆学专业主要研究文物的保护、修复、鉴定、展示以及博物馆的运营管理，包括文物学、博物馆学、考古学、文物保护技术等方向。核心课程包括文物学概论、博物馆学概论、考古学通论、文物保护技术、文物鉴定、博物馆陈列设计等。毕业生可在博物馆、文物部门、考古机构、文化企业从事文物管理、博物馆运营、文物修复、文化传播等工作，是文化遗产保护的重要专业。',
  },
  {
    id: 'translation',
    name: '翻译',
    category: 'arts',
    hotScore: 81,
    strongUniversities: ['bfsu', 'shisu', 'xisu', 'fudan', 'nju', 'sysu'],
    description: '翻译专业培养具备扎实的语言功底和翻译技能的专业人才，包括笔译、口译、同声传译等方向。核心课程包括翻译理论与实践、笔译技巧、口译技巧、同声传译、文学翻译、商务翻译、科技翻译等。毕业生可在政府部门、企业、翻译公司、媒体从事翻译、口译、本地化等工作，随着国际化程度提高，翻译人才需求量大。',
  },
  {
    id: 'archaeology',
    name: '考古学',
    category: 'arts',
    hotScore: 70,
    strongUniversities: ['pku', 'jlu', 'nku', 'nwu', 'nju', 'scu'],
    description: '考古学专业主要研究古代人类社会和文化的物质遗存，包括田野考古、考古理论、考古技术、文化遗产保护等方向。核心课程包括考古学导论、中国考古学、世界考古学、田野考古方法、考古学理论与方法、文物保护等。毕业生可在考古机构、博物馆、文物部门、高校从事考古发掘、文物研究、文物保护、教学等工作，是历史研究和文化遗产保护的重要专业。',
  },
  {
    id: 'cultural-industry',
    name: '文化产业管理',
    category: 'arts',
    hotScore: 79,
    strongUniversities: ['cuc', 'pku', 'fudan', 'ruc', 'sysu', 'whu'],
    description: '文化产业管理专业主要研究文化产业的发展规律、经营管理、政策法规等，包括文化创意产业、文化市场、文化传播、文化品牌等方向。核心课程包括文化产业概论、文化经济学、文化市场营销、文化创意产业、文化政策与法规、文化企业管理等。毕业生可在文化企业、文化部门、媒体、旅游企业从事文化项目管理、文化市场运营、文化品牌策划等工作，随着文化产业发展，就业前景良好。',
  },
  {
    id: 'psychology-arts',
    name: '心理学',
    category: 'arts',
    hotScore: 84,
    strongUniversities: ['bnu', 'ecnu', 'pku', 'ruc', 'hustc', 'swu'],
    description: '心理学专业主要研究人类的心理现象和行为规律，包括认知心理学、发展心理学、社会心理学、临床心理学、教育心理学等方向。核心课程包括普通心理学、实验心理学、心理统计、心理测量、发展心理学、社会心理学等。毕业生可在教育、医疗、企业、咨询、科研等领域从事心理咨询、心理评估、人力资源管理、用户体验设计、心理研究等工作，应用面广、需求量大。',
  },
  // 理科新增专业
  {
    id: 'environmental-science',
    name: '环境科学',
    category: 'science',
    hotScore: 80,
    strongUniversities: ['pku', 'fudan', 'zju', 'nju', 'sysu', 'scu'],
    description:
      '环境科学专业主要研究环境污染的形成机理与治理技术、生态环境保护和可持续发展等问题，课程涵盖环境化学、环境监测、环境评价、生态学等内容，就业方向包括环保部门、规划设计院、环保企业、科研院所等。',
  },
  {
    id: 'geography-science',
    name: '地理科学',
    category: 'science',
    hotScore: 78,
    strongUniversities: ['bnu', 'nnu', 'scnu', 'xmu', 'nwu', 'nankai'],
    description:
      '地理科学专业研究自然地理与人文地理的时空分布规律，涉及气候变化、水文、土壤、地貌、人口城市等内容，是中学地理教师和地理研究人员的重要来源，就业方向包括教育、规划、测绘、资源与环境管理等。',
  },
  {
    id: 'astronomy',
    name: '天文学',
    category: 'science',
    hotScore: 76,
    strongUniversities: ['pku', 'nju', 'ustc', 'xfu', 'yau'],
    description:
      '天文学专业主要研究宇宙中的天体及其运动规律，课程包括天体物理、天体力学、电磁学、射电天文学等，毕业生多进入天文台、科研院所、高校从事科研与教学，也可在航天、信息技术等行业从事相关工作。',
  },
  {
    id: 'marine-science',
    name: '海洋科学',
    category: 'science',
    hotScore: 77,
    strongUniversities: ['ouc', 'xmu', 'sdust', 'tongji', 'sdu'],
    description:
      '海洋科学专业以海洋环境、海洋资源和海洋生态为研究对象，涉及物理海洋、海洋生物、海洋化学等方向，在海洋调查、海洋工程、海洋生态保护等领域具有广泛应用。',
  },
  {
    id: 'geology',
    name: '地质学',
    category: 'science',
    hotScore: 75,
    strongUniversities: ['cugb', 'cug', 'pku', 'nju', 'ustc'],
    description:
      '地质学专业研究地球的组成、结构及其演化，课程涵盖矿物岩石学、构造地质学、地层古生物学等，毕业生可在能源、矿产、工程勘察、环境评价等行业从事勘探与研究工作。',
  },
  {
    id: 'geophysics',
    name: '地球物理学',
    category: 'science',
    hotScore: 74,
    strongUniversities: ['pku', 'ustc', 'cug', 'nju', 'hit'],
    description:
      '地球物理学专业利用物理方法研究地球内部结构与演化，主要课程包括重力与磁法、电法、地震勘探等，在石油、矿产勘探及地震监测等领域具有重要作用。',
  },
  {
    id: 'biotechnology-science',
    name: '生物技术',
    category: 'science',
    hotScore: 82,
    strongUniversities: ['fudan', 'zju', 'sysu', 'nju', 'scu'],
    description:
      '生物技术专业以分子生物学和基因工程为基础，研究生物产品的开发与应用，涉及医药、农业、食品、环保等领域，就业方向包括生物医药企业、科研院所、检测机构等。',
  },
  {
    id: 'applied-chemistry-science',
    name: '应用化学',
    category: 'science',
    hotScore: 79,
    strongUniversities: ['tju', 'buct', 'fudan', 'zju', 'sdu'],
    description:
      '应用化学专业强调化学原理在材料、能源、环境等领域的应用，课程包括有机合成、材料化学、分析化学等，毕业生可在化工、材料、环保、制药等行业从事研发和技术管理工作。',
  },
  {
    id: 'microbiology-science',
    name: '微生物学',
    category: 'science',
    hotScore: 73,
    strongUniversities: ['nju', 'fudan', 'zju', 'scu', 'sysu'],
    description:
      '微生物学专业主要研究细菌、真菌、病毒等微生物及其应用，在医药、发酵工程、环保等领域具有重要作用，就业方向包括生物制药、食品发酵、疾病防控等。',
  },
  {
    id: 'ecology-science',
    name: '生态学',
    category: 'science',
    hotScore: 72,
    strongUniversities: ['pku', 'nankai', 'fudan', 'scu', 'xmu'],
    description:
      '生态学专业研究生物与环境之间的相互关系，关注生态系统保护与修复、自然保护区管理等内容，是推进绿色发展和生态文明建设的重要基础学科。',
  },
  // 工科新增专业
  {
    id: 'energy-power-engineering',
    name: '能源与动力工程',
    category: 'engineering',
    hotScore: 84,
    strongUniversities: ['seu', 'tju', 'sjtu', 'zju', 'xju'],
    description:
      '能源与动力工程专业主要研究能源转换与利用、动力装置设计与运行等问题，涉及火电、核电、可再生能源等方向，是传统能源工业与新能源产业的重要支撑专业。',
  },
  {
    id: 'aerospace-engineering',
    name: '飞行器设计与工程',
    category: 'engineering',
    hotScore: 86,
    strongUniversities: ['buaa', 'nwpu', 'hit', 'nuaa'],
    description:
      '飞行器设计与工程专业主要研究飞机、火箭等飞行器的总体设计与结构设计，课程包括空气动力学、飞行动力学、飞行器结构力学等，就业方向集中在航空航天企事业单位。',
  },
  {
    id: 'vehicle-engineering',
    name: '车辆工程',
    category: 'engineering',
    hotScore: 82,
    strongUniversities: ['jlu', 'tongji', 'cqu', 'scut', 'nefu'],
    description:
      '车辆工程专业主要研究汽车及轨道车辆的设计、制造与测试，涉及整车设计、新能源汽车、智能网联汽车等方向，毕业生主要进入汽车及相关制造企业从事研发与技术工作。',
  },
  {
    id: 'traffic-engineering',
    name: '交通工程',
    category: 'engineering',
    hotScore: 80,
    strongUniversities: ['seu', 'tongji', 'bjtu', 'swjtu'],
    description:
      '交通工程专业研究交通系统的规划、设计、运营与管理，课程包括道路交通工程、交通规划、智能交通等内容，就业领域涵盖城市规划设计院、交通管理部门、交通咨询公司等。',
  },
  {
    id: 'environmental-engineering',
    name: '环境工程',
    category: 'engineering',
    hotScore: 81,
    strongUniversities: ['tju', 'buct', 'tongji', 'zju', 'scut'],
    description:
      '环境工程专业主要研究水、气、固体废物等污染物的治理技术与工程实施，是环境保护与生态修复的重要技术支撑专业，就业方向包括环保公司、设计院、环保部门等。',
  },
  {
    id: 'safety-engineering',
    name: '安全工程',
    category: 'engineering',
    hotScore: 78,
    strongUniversities: ['cqu', 'cug', 'ustb', 'neu'],
    description:
      '安全工程专业研究工业生产中的安全风险识别与防控，涉及安全评价、安全监控、应急管理等内容，毕业生可在能源化工、矿业、施工等行业从事安全管理和技术支持。',
  },
  {
    id: 'mining-engineering',
    name: '采矿工程',
    category: 'engineering',
    hotScore: 76,
    strongUniversities: ['cqu', 'cug', 'csm', 'nepu'],
    description:
      '采矿工程专业主要研究矿产资源的开采技术与安全管理，课程包括矿井建设、露天开采、矿山压力与岩层控制等，就业方向集中在煤炭、有色金属等矿业企业及相关设计研究单位。',
  },
  {
    id: 'petroleum-engineering',
    name: '石油工程',
    category: 'engineering',
    hotScore: 79,
    strongUniversities: ['cupi', 'nepu', 'swpu'],
    description:
      '石油工程专业研究油气资源的勘探与开发，涉及钻井工程、油藏工程、采油工程等课程，毕业生主要在油气田企业、工程技术服务公司从事现场技术和管理工作。',
  },
  {
    id: 'surveying-mapping',
    name: '测绘工程',
    category: 'engineering',
    hotScore: 77,
    strongUniversities: ['whu', 'cug', 'seu', 'tongji'],
    description:
      '测绘工程专业以获取和处理空间位置信息为核心，涉及工程测量、摄影测量与遥感、地理信息系统等方向，是国土空间规划、工程建设、导航定位的重要基础。',
  },
  {
    id: 'logistics-engineering',
    name: '物流工程',
    category: 'engineering',
    hotScore: 80,
    strongUniversities: ['sjtu', 'seu', 'dlut', 'swjtu'],
    description:
      '物流工程专业主要研究物流系统规划、仓储与配送、供应链管理等内容，结合信息技术和工程技术优化物流运作，毕业生可在物流企业、电商平台、制造企业从事运营管理和系统设计工作。',
  },
  // 文科新增专业
  {
    id: 'accounting',
    name: '会计学',
    category: 'arts',
    hotScore: 90,
    strongUniversities: ['ruc', 'swufe', 'xmu', 'cufe', 'nankai'],
    description:
      '会计学专业主要研究会计核算、财务管理和审计等内容，是企业和机构财务管理的核心专业，就业方向包括会计师事务所、企业财务部门、银行及各类金融机构等。',
  },
  {
    id: 'international-trade',
    name: '国际经济与贸易',
    category: 'arts',
    hotScore: 88,
    strongUniversities: ['uibe', 'xmu', 'ruc', 'fudan', 'swufe'],
    description:
      '国际经济与贸易专业研究国际贸易理论与实务、跨国经营与国际市场营销等内容，毕业生可在外贸公司、跨国企业、金融机构、政府部门从事外贸业务、跨境电商、国际市场分析等工作。',
  },
  {
    id: 'marketing',
    name: '市场营销',
    category: 'arts',
    hotScore: 84,
    strongUniversities: ['pku', 'fudan', 'xmu', 'ruc', 'sysu'],
    description:
      '市场营销专业主要研究市场调研、消费者行为、品牌策划、营销策略等内容，是企业市场与品牌管理的重要专业，就业方向包括品牌管理、广告策划、产品运营、销售管理等。',
  },
  {
    id: 'journalism',
    name: '新闻学',
    category: 'arts',
    hotScore: 82,
    strongUniversities: ['cuc', 'fudan', 'sysu', 'whu', 'xmu'],
    description:
      '新闻学专业主要研究新闻采写、编辑与评论等内容，培养具备新闻采访、写作、编辑和策划能力的人才，就业方向包括媒体机构、新媒体平台、政府与企事业单位宣传部门等。',
  },
  {
    id: 'broadcasting-hosting',
    name: '播音与主持艺术',
    category: 'arts',
    hotScore: 80,
    strongUniversities: ['cuc', 'bjdx', 'shisu', 'xmu'],
    description:
      '播音与主持艺术专业主要培养广播电视播音员、节目主持人等，课程包括播音发声、节目主持、即兴口语表达等，就业方向为电视台、电台、新媒体平台及公共活动主持等。',
  },
  {
    id: 'public-administration',
    name: '公共事业管理',
    category: 'arts',
    hotScore: 78,
    strongUniversities: ['ruc', 'pku', 'whu', 'xmu'],
    description:
      '公共事业管理专业研究公共部门管理与公共服务提供机制，涉及教育、文化、卫生、社会保障等多个领域，毕业生可在政府部门、事业单位、社会组织从事管理与公共服务工作。',
  },
  {
    id: 'sociology',
    name: '社会学',
    category: 'arts',
    hotScore: 76,
    strongUniversities: ['pku', 'ruc', 'nankai', 'fudan', 'sysu'],
    description:
      '社会学专业研究社会结构与社会关系的运行规律，课程包括社会调查研究方法、社会问题分析等，毕业生可在党政机关、企事业单位、社会组织从事社会调查、政策研究、人力资源等工作。',
  },
  {
    id: 'social-work',
    name: '社会工作',
    category: 'arts',
    hotScore: 75,
    strongUniversities: ['ruc', 'whu', 'sysu', 'ecnu'],
    description:
      '社会工作专业培养从事社会救助、社区服务、儿童与青少年服务、老年服务等领域的专业社会工作者，就业方向包括民政、社区机构、公益组织、医院等单位。',
  },
  {
    id: 'visual-communication-design',
    name: '视觉传达设计',
    category: 'arts',
    hotScore: 83,
    strongUniversities: ['cafa', 'lzu', 'tongji', 'scut'],
    description:
      '视觉传达设计专业主要研究平面设计、品牌形象、界面设计等内容，强调创意与审美能力的培养，毕业生可在广告公司、互联网公司、设计机构从事视觉设计与品牌设计工作。',
  },
  {
    id: 'music-performance',
    name: '音乐表演',
    category: 'arts',
    hotScore: 79,
    strongUniversities: ['ccom', 'shcm', 'xcm', 'sica'],
    description:
      '音乐表演专业主要培养具有较高音乐素养与演奏（演唱）能力的专业人才，就业方向包括文艺团体、学校、文化机构以及独立音乐创作与表演等。',
  },
  // 医科新增5个专业
  {
    id: 'medical-laboratory',
    name: '医学检验技术',
    category: 'medicine',
    hotScore: 82,
    strongUniversities: ['pku', 'sjtu', 'zju', 'fudan', 'cmu', 'scu'],
    description: '医学检验技术专业主要培养从事临床检验、实验室诊断、检验仪器操作与维护的技术人才。主要学习基础医学、临床医学、医学检验技术、临床生物化学检验、临床微生物学检验、临床血液学检验、临床免疫学检验等课程。医学检验技术人员是医疗团队的重要成员，负责各类检验项目的操作和质量控制，随着精准医疗的发展，该专业的重要性日益凸显。',
  },
  {
    id: 'ophthalmology',
    name: '眼视光医学',
    category: 'medicine',
    hotScore: 83,
    strongUniversities: ['sjtu', 'zju', 'fudan', 'cmu', 'scu'],
    description: '眼视光医学专业主要研究眼部疾病的诊断、治疗和视觉功能的保护与改善，包括眼科临床、视光学、视觉康复等方向。主要课程包括眼科学基础、临床眼科学、视光学基础、眼视光器械学、视觉功能评估、视觉康复等。随着电子设备普及和人口老龄化，眼部疾病和视觉问题增多，眼视光医学专业的需求持续增长，就业前景良好。',
  },
  {
    id: 'radiotherapy',
    name: '放射医学',
    category: 'medicine',
    hotScore: 80,
    strongUniversities: ['pku', 'sjtu', 'zju', 'fudan', 'cmu'],
    description: '放射医学专业主要研究放射诊断和放射治疗在医学中的应用，包括医学影像诊断、放射治疗、核医学等方向。主要课程包括医学影像设备学、影像诊断学、放射治疗学、核医学、放射防护等。放射医学是肿瘤治疗的重要手段，随着肿瘤发病率的提高，放射医学专业人才需求量大，毕业生可在医院、肿瘤中心从事放射诊断和治疗工作。',
  },
  {
    id: 'emergency-medicine',
    name: '急诊医学',
    category: 'medicine',
    hotScore: 85,
    strongUniversities: ['pku', 'sjtu', 'zju', 'fudan', 'cmu', 'scu'],
    description: '急诊医学专业主要研究急危重症的快速诊断、紧急处理和抢救，培养能够在急诊科从事急危重症救治的医学人才。主要课程包括急诊医学概论、急危重症医学、创伤急救、中毒急救、心肺复苏、急诊护理等。急诊医生是医疗体系的重要环节，随着急诊医疗服务需求的增加，急诊医学专业人才需求量大，工作强度高但成就感强。',
  },
  {
    id: 'mental-health',
    name: '精神医学',
    category: 'medicine',
    hotScore: 86,
    strongUniversities: ['pku', 'sjtu', 'zju', 'fudan', 'scu'],
    description: '精神医学专业主要研究精神疾病的诊断、治疗和预防，以及心理健康的维护，包括临床精神病学、儿童精神病学、老年精神病学等方向。主要课程包括精神病学基础、临床精神病学、心理治疗、精神药理学、精神疾病康复等。随着社会压力增大和人们对心理健康的重视，精神医学专业的需求持续增长，毕业生可在精神卫生中心、综合医院精神科从事精神疾病的诊疗工作。',
  },
  // 30个新增热门专业
  {
    id: 'robotics-eng',
    name: '机器人工程',
    category: 'engineering',
    hotScore: 92,
    strongUniversities: ['hit', 'sjtu', 'zju', 'neu', 'hust'],
    description: '机器人工程专业研究机器人的设计、制造、控制和应用，涉及机械、电子、控制、人工智能等多个领域。毕业生可在高端制造、智能系统等领域从事研发工作。',
  },
  {
    id: 'intelligent-sci',
    name: '智能科学与技术',
    category: 'science',
    hotScore: 90,
    strongUniversities: ['pku', 'tsinghua', 'cas', 'fudan'],
    description: '智能科学与技术专业研究人工智能的基本理论和技术，包括机器学习、模式识别、认知科学等。',
  },
  {
    id: 'ic-design',
    name: '集成电路设计与集成系统',
    category: 'engineering',
    hotScore: 95,
    strongUniversities: ['tsinghua', 'pku', 'fudan', 'uestc', 'xidian'],
    description: '集成电路设计与集成系统专业专注于芯片的设计、开发和集成，是支撑信息产业的核心专业。',
  },
  {
    id: 'microelectronics',
    name: '微电子科学与工程',
    category: 'engineering',
    hotScore: 93,
    strongUniversities: ['tsinghua', 'pku', 'fudan', 'zju', 'uestc'],
    description: '微电子科学与工程专业研究半导体材料、器件和电路的原理、设计与制造。',
  },
  {
    id: 'instrument-tech',
    name: '测控技术与仪器',
    category: 'engineering',
    hotScore: 84,
    strongUniversities: ['tsinghua', 'hit', 'buaa', 'tju'],
    description: '测控技术与仪器专业研究信息的获取、处理、传输和控制技术，是工业自动化的重要基础。',
  },
  {
    id: 'energy-env-eng',
    name: '能源与环境系统工程',
    category: 'engineering',
    hotScore: 82,
    strongUniversities: ['tsinghua', 'zju', 'sjtu', 'xjtu'],
    description: '能源与环境系统工程专业研究能源的高效利用与环境保护的协调发展，涉及热能工程、环境工程等。',
  },
  {
    id: 'composite-materials',
    name: '复合材料与工程',
    category: 'engineering',
    hotScore: 86,
    strongUniversities: ['hit', 'bit', 'whut', 'nwpu'],
    description: '复合材料与工程专业研究多组分材料的设计、制备和性能，广泛应用于航空航天、汽车、体育器材等领域。',
  },
  {
    id: 'industrial-design',
    name: '工业设计',
    category: 'engineering',
    hotScore: 88,
    strongUniversities: ['tsinghua', 'hnu', 'jiangnan', 'tongji'],
    description: '工业设计专业结合艺术、科学和技术，研究产品的外观、结构和人机交互，提升产品价值和用户体验。',
  },
  {
    id: 'process-equipment',
    name: '过程装备与控制工程',
    category: 'engineering',
    hotScore: 81,
    strongUniversities: ['ecust', 'tju', 'zju', 'cup'],
    description: '过程装备与控制工程专业研究化工、能源、制药等过程工业中的装备设计及其自动化控制。',
  },
  {
    id: 'port-coastal-eng',
    name: '港口航道与海岸工程',
    category: 'engineering',
    hotScore: 83,
    strongUniversities: ['hhu', 'tju', 'dlut', 'whu'],
    description: '港口航道与海岸工程专业研究港口建设、航道治理、海岸带开发与保护等工程技术。',
  },
  {
    id: 'aircraft-power',
    name: '飞行器动力工程',
    category: 'engineering',
    hotScore: 87,
    strongUniversities: ['buaa', 'nwpu', 'nuaa', 'tsinghua'],
    description: '飞行器动力工程专业研究航空发动机、火箭发动机的原理、设计和维护。',
  },
  {
    id: 'aircraft-manufacturing',
    name: '飞行器制造工程',
    category: 'engineering',
    hotScore: 85,
    strongUniversities: ['nwpu', 'buaa', 'nuaa', 'sjtu'],
    description: '飞行器制造工程专业研究飞机的装配、加工和数字化制造技术。',
  },
  {
    id: 'explosive-tech',
    name: '弹药工程与爆炸技术',
    category: 'engineering',
    hotScore: 80,
    strongUniversities: ['bit', 'njust'],
    description: '弹药工程与爆炸技术专业研究弹药的设计、制造和爆炸效应，是国防科技的重要组成部分。',
  },
  {
    id: 'radiation-protection',
    name: '辐射防护与核安全',
    category: 'engineering',
    hotScore: 82,
    strongUniversities: ['tsinghua', 'pku', 'heu', 'lzu'],
    description: '辐射防护与核安全专业研究核设施的辐射监测、防护设计和核安全管理。',
  },
  {
    id: 'prosthetics-eng',
    name: '假肢矫形工程',
    category: 'engineering',
    hotScore: 78,
    strongUniversities: ['ccmu', 'scu'],
    description: '假肢矫形工程专业结合医学和工程学，研究助残器材的设计、配置和康复应用。',
  },
  {
    id: 'agri-mechanization',
    name: '农业机械化及其自动化',
    category: 'engineering',
    hotScore: 79,
    strongUniversities: ['cau', 'njau', 'zju'],
    description: '农业机械化及其自动化专业研究现代农业机械的设计、应用和智能化管理。',
  },
  {
    id: 'forestry-eng-new',
    name: '森林工程',
    category: 'engineering',
    hotScore: 77,
    strongUniversities: ['nefu', 'bjfu', 'njfu'],
    description: '森林工程专业研究森林资源的开发、利用和林业机械设备的运行管理。',
  },
  {
    id: 'wood-science',
    name: '木材科学与工程',
    category: 'engineering',
    hotScore: 76,
    strongUniversities: ['bjfu', 'njfu', 'nefu'],
    description: '木材科学与工程专业研究木材的性质、加工技术和木制品的设计制造。',
  },
  {
    id: 'vet-medicine',
    name: '动物医学',
    category: 'medicine',
    hotScore: 89,
    strongUniversities: ['cau', 'hzau', 'njau'],
    description: '动物医学专业研究动物疾病的诊断、治疗和预防，以及公共卫生安全。',
  },
  {
    id: 'quarantine-tech',
    name: '动植物检疫',
    category: 'medicine',
    hotScore: 81,
    strongUniversities: ['cau', 'njau'],
    description: '动植物检疫专业研究动植物疫病的监测、鉴定和口岸检疫监督。',
  },
  {
    id: 'aquaculture',
    name: '水产养殖学',
    category: 'science',
    hotScore: 82,
    strongUniversities: ['ouc', 'scau'],
    description: '水产养殖学专业研究水生动植物的育种、养殖技术和水环境管理。',
  },
  {
    id: 'landscape-arch',
    name: '园林',
    category: 'engineering',
    hotScore: 85,
    strongUniversities: ['bjfu', 'njfu', 'tsinghua'],
    description: '园林专业研究城乡绿地系统、风景名胜区、居住区环境的规划设计与养护。',
  },
  {
    id: 'tea-science',
    name: '茶学',
    category: 'science',
    hotScore: 78,
    strongUniversities: ['ahau', 'zju', 'hnum'],
    description: '茶学专业研究茶树育种、茶叶加工、茶文化和茶产业经营。',
  },
  {
    id: 'brewing-eng',
    name: '酿酒工程',
    category: 'engineering',
    hotScore: 84,
    strongUniversities: ['jiangnan', 'scut'],
    description: '酿酒工程专业研究酒类产品的生产工艺、发酵控制和质量检测。',
  },
  {
    id: 'non-woven',
    name: '非织造材料与工程',
    category: 'engineering',
    hotScore: 80,
    strongUniversities: ['dhu', 'tjpu'],
    description: '非织造材料与工程专业研究非织造材料（如无纺布）的结构、性能和加工技术。',
  },
  {
    id: 'packaging-eng',
    name: '包装工程',
    category: 'engineering',
    hotScore: 79,
    strongUniversities: ['jnu', 'hust', 'whut'],
    description: '包装工程专业研究包装材料、容器设计、包装机械和包装印刷技术。',
  },
  {
    id: 'printing-eng',
    name: '印刷工程',
    category: 'engineering',
    hotScore: 77,
    strongUniversities: ['wuhan', 'bjigl'],
    description: '印刷工程专业研究图文信息的获取、处理、存储、传输和再现技术。',
  },
  {
    id: 'digital-media',
    name: '数字媒体技术',
    category: 'engineering',
    hotScore: 88,
    strongUniversities: ['zju', 'whu', 'bit'],
    description: '数字媒体技术专业涉及计算机图形学、多媒体技术、游戏开发等，培养数字内容创作人才。',
  },
  {
    id: 'blockchain-eng',
    name: '区块链工程',
    category: 'engineering',
    hotScore: 91,
    strongUniversities: ['tsinghua', 'zju', 'bupt'],
    description: '区块链工程专业研究分布式系统、密码学、智能合约等，是构建可信社会的技术基础。',
  },
  {
    id: 'fintech-major',
    name: '金融科技',
    category: 'science',
    hotScore: 90,
    strongUniversities: ['pku', 'ruc', 'sufe'],
    description: '金融科技专业结合金融学与信息技术，研究移动支付、智能投顾、大数据风控等。',
  },
]

// 获取所有专业（包含用户添加的）
export function getAllMajors(): Major[] {
  if (typeof window === 'undefined') {
    return majors
  }

  try {
    const stored = localStorage.getItem('userAddedMajors')
    if (stored) {
      const parsed = JSON.parse(stored) as Major[]
      // 仅对外展示已审核通过的用户专业（isApproved 未设置或 true 视为已通过）
      const approvedUserMajors = Array.isArray(parsed)
        ? parsed.filter((m) => m.isApproved !== false)
        : []
      return [...majors, ...approvedUserMajors]
    }
  } catch (error) {
    console.error('Error loading majors:', error)
  }

  return majors
}

function readUserAddedMajors(): Major[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem('userAddedMajors')
    if (!stored) return []
    const parsed = JSON.parse(stored) as Major[]
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('Error loading majors:', error)
    return []
  }
}

// 添加用户自定义专业
export function addUserMajor(data: {
  name: string
  category: MajorCategory
  description: string
  // 在该专业上较强的院校ID列表（可选）
  strongUniversities?: string[]
  creatorId?: string
}): Major {
  const newMajor: Major = {
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: data.name,
    category: data.category,
    description: data.description,
    hotScore: 60,
    strongUniversities: data.strongUniversities ?? [],
    isUserAdded: true,
    // 新增专业默认处于待审核状态，管理员审核通过后才对所有用户可见
    isApproved: false,
    reviewStatus: 'pending',
    creatorId: data.creatorId,
  }

  if (typeof window !== 'undefined') {
    try {
      const list = readUserAddedMajors()
      list.push(newMajor)
      localStorage.setItem('userAddedMajors', JSON.stringify(list))
    } catch (error) {
      console.error('Error saving user major:', error)
    }
  }

  return newMajor
}

// 管理员：获取所有用户新增专业（包含待审核和已审核）
export function getUserAddedMajors(): Major[] {
  return readUserAddedMajors()
}

// 管理员：审核通过某个用户新增专业
export function approveUserMajor(majorId: string): boolean {
  if (typeof window === 'undefined') return false
  try {
    const list = readUserAddedMajors()
    const index = list.findIndex((m) => m.id === majorId)
    if (index === -1) return false
    list[index] = { ...list[index], isApproved: true, reviewStatus: 'approved' }
    localStorage.setItem('userAddedMajors', JSON.stringify(list))
    return true
  } catch (error) {
    console.error('Error approving major:', error)
    return false
  }
}

// 管理员：删除/拒绝某个用户新增专业
export function deleteUserMajor(majorId: string, reason?: string): boolean {
  if (typeof window === 'undefined') return false
  try {
    const list = readUserAddedMajors()
    const index = list.findIndex((m) => m.id === majorId)
    if (index === -1) return false
    list[index] = { 
      ...list[index], 
      isApproved: false, 
      reviewStatus: 'rejected',
      rejectionReason: reason 
    }
    localStorage.setItem('userAddedMajors', JSON.stringify(list))
    return true
  } catch (error) {
    console.error('Error deleting user major:', error)
    return false
  }
}

// 管理员：编辑用户提交的专业信息
export function updateUserMajor(majorId: string, updates: Partial<Major>): boolean {
  if (typeof window === 'undefined') return false
  try {
    const list = readUserAddedMajors()
    const index = list.findIndex((m) => m.id === majorId)
    if (index === -1) return false
    
    list[index] = { ...list[index], ...updates }
    localStorage.setItem('userAddedMajors', JSON.stringify(list))
    return true
  } catch (error) {
    console.error('Error updating user major:', error)
    return false
  }
}

export function getMajorById(id: string): Major | undefined {
  const all = getAllMajors()
  return all.find((m) => m.id === id)
}
















