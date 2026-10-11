export type MajorCategory = 'science' | 'engineering' | 'arts' | 'medicine' | 'other'

export interface Major {
  id: string
  name: string
  category: MajorCategory // 五个展示板块；经管教育属广义文科，农学艺术体育属其他
  description: string
  officialCode?: string // 教育部本科专业代码；五个展示板块采用广义学科分组
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
    "id": "cs",
    "name": "计算机科学与技术",
    "category": "engineering",
    "description": "计算机科学与技术专业主要研究计算机系统的组成原理、软硬件开发方法与应用技术。核心课程包括数据结构与算法、操作系统、计算机网络、数据库系统、编译原理、人工智能等。毕业生可从事软件开发、算法工程、系统架构、产品研发、技术管理等工作，就业方向涵盖互联网公司、金融机构、制造业、科研院所等，学习过程中需要扎实的数学基础和大量的实践训练。",
    "hotScore": 100,
    "strongUniversities": [
      "tsinghua",
      "pku",
      "zju",
      "sjtu",
      "ustc",
      "xju",
      "uestc",
      "scut",
      "hust",
      "hfut",
      "hdu"
    ],
    "officialCode": "080901"
  },
  {
    "id": "se",
    "name": "软件工程",
    "category": "engineering",
    "description": "软件工程专业以工程化方法开发和维护软件为核心，强调需求分析、系统设计、编码实现、测试与运维的完整流程。课程通常涵盖软件工程导论、需求工程、软件体系结构、软件测试、项目管理、敏捷开发等内容，并通过团队项目训练学生的协作与工程实践能力。毕业生可在互联网企业、传统行业的信息化部门从事软件开发工程师、测试工程师、项目经理等岗位，适合喜欢做项目、善于沟通协作的同学。",
    "hotScore": 92,
    "strongUniversities": [
      "tsinghua",
      "zju",
      "sjtu",
      "uestc",
      "scut",
      "hust",
      "hfut",
      "hdu",
      "zjut"
    ],
    "officialCode": "080902"
  },
  {
    "id": "ee",
    "name": "电子信息工程",
    "category": "engineering",
    "description": "电子信息工程专业主要研究电子设备与信息系统的设计、开发与应用，涉及电路、信号与系统、通信原理、数字信号处理、嵌入式系统等内容。该专业既有偏硬件的电路与系统设计，也有偏软件的信号处理与通信算法，需要较好的数学和物理基础。毕业生可在通信运营商、通信设备厂商、电子类企业和科研院所从事硬件开发、通信系统设计、信号处理算法开发等工作。",
    "hotScore": 88,
    "strongUniversities": [
      "xidian",
      "uestc",
      "scut",
      "hust",
      "xju",
      "hit",
      "hdu",
      "bupt"
    ],
    "officialCode": "080701"
  },
  {
    "id": "math",
    "name": "数学与应用数学",
    "category": "science",
    "description": "数学与应用数学专业注重数学基础理论与应用能力的培养，主干课程包括高等代数、数学分析、常微分方程、概率论与数理统计、实变函数、复变函数等。该专业训练同学的逻辑思维能力和抽象思维能力，是很多交叉学科（如人工智能、金融工程、量化分析）的重要基础。毕业去向包括继续深造、进入高校和科研机构，以及到金融、互联网、咨询等行业从事建模分析、算法研究等工作。",
    "hotScore": 85,
    "strongUniversities": [
      "pku",
      "tsinghua",
      "zju",
      "nju",
      "ustc",
      "ruc",
      "sdu"
    ],
    "officialCode": "070101"
  },
  {
    "id": "physics",
    "name": "物理学",
    "category": "science",
    "description": "物理学专业主要研究自然界中物质的基本结构及其运动规律，涵盖力学、电磁学、热学、光学、量子力学、统计物理等方向。学习过程对数学要求较高，需要同学具有较强的抽象思维和耐心。毕业后既可以继续攻读研究生从事基础研究，也可以转向材料、电子、能源、金融工程等应用领域，就业方向相对宽广但更加依赖后续深造与个人发展规划。",
    "hotScore": 78,
    "strongUniversities": [
      "pku",
      "tsinghua",
      "ustc",
      "nju",
      "zju",
      "hit",
      "sdu"
    ],
    "officialCode": "070201"
  },
  {
    "id": "chinese",
    "name": "汉语言文学",
    "category": "arts",
    "description": "汉语言文学专业主要研究中国语言文字及古今文学作品，课程包括现代汉语、古代汉语、中国文学史、文学概论、写作学等。专业强调阅读与写作能力，适合喜欢文学、对文字敏感的同学。毕业后可从事中学语文教师、编辑、记者、公务员、新媒体内容运营等工作，也可以继续深造从事学术研究，是打基础、可转向多种人文社科方向的专业。",
    "hotScore": 83,
    "strongUniversities": [
      "pku",
      "nju",
      "whu",
      "bnu",
      "snnu",
      "yau",
      "bjwlxy"
    ],
    "officialCode": "050101"
  },
  {
    "id": "law",
    "name": "法学",
    "category": "arts",
    "description": "法学专业系统学习宪法、民法、刑法、行政法、经济法、国际法等法律部门的基本理论与制度，培养学生的法学思维与法律实务能力。学习过程中需要大量阅读法规与案例，训练严谨的逻辑推理和分析论证能力。毕业后可通过司法考试从事律师、法官、检察官等职业，也可在企事业单位、政府机关从事法务、合规、政策研究等工作。",
    "hotScore": 90,
    "strongUniversities": [
      "ruc",
      "cufe",
      "pku",
      "whu",
      "cau",
      "swufe",
      "nwsuaf"
    ],
    "officialCode": "030101K"
  },
  {
    "id": "ai",
    "name": "人工智能",
    "category": "engineering",
    "description": "人工智能专业是计算机科学的一个分支，主要研究如何让机器模拟人类智能，包括机器学习、深度学习、自然语言处理、计算机视觉等方向。核心课程包括人工智能导论、机器学习、神经网络、数据挖掘、模式识别等。毕业生可在互联网公司、科技企业、科研院所从事算法工程师、AI产品经理、研究科学家等工作，是当前最热门的专业之一，就业前景广阔，薪资水平高。",
    "hotScore": 98,
    "strongUniversities": [
      "tsinghua",
      "pku",
      "zju",
      "sjtu",
      "ustc",
      "nju",
      "xju",
      "uestc",
      "scut"
    ],
    "officialCode": "080717T"
  },
  {
    "id": "ds",
    "name": "数据科学与大数据技术",
    "category": "engineering",
    "description": "数据科学与大数据技术专业培养具备数据科学理论基础和大数据处理能力的人才，涵盖统计学、机器学习、数据库、分布式计算等内容。主要课程包括数据科学导论、大数据技术、数据挖掘、数据可视化、云计算等。毕业生可在互联网、金融、电商、政府等领域从事数据分析师、数据工程师、算法工程师等岗位，随着大数据时代的到来，该专业需求量大、发展前景好。",
    "hotScore": 95,
    "strongUniversities": [
      "tsinghua",
      "pku",
      "zju",
      "sjtu",
      "ustc",
      "nju",
      "xju",
      "uestc"
    ],
    "officialCode": "080910T"
  },
  {
    "id": "auto",
    "name": "自动化",
    "category": "engineering",
    "description": "自动化专业以控制理论为基础，研究自动控制系统设计、分析与优化，涉及工业自动化、智能控制、机器人技术等方向。核心课程包括自动控制原理、现代控制理论、过程控制、计算机控制技术、机器人学等。毕业生可在制造业、电力系统、航空航天、机器人等领域从事自动化系统设计、控制算法开发、系统集成等工作，就业面广，是传统工科中的热门专业。",
    "hotScore": 87,
    "strongUniversities": [
      "tsinghua",
      "zju",
      "sjtu",
      "xju",
      "hit",
      "hust",
      "neu",
      "scut"
    ],
    "officialCode": "080801"
  },
  {
    "id": "me",
    "name": "机械工程",
    "category": "engineering",
    "description": "机械工程专业是工程学科中最广泛的专业之一，主要研究机械设计、制造、自动化等方面的理论与技术。核心课程包括机械设计、机械制造基础、材料力学、理论力学、机械原理、CAD/CAM等。毕业生可在制造业、汽车工业、航空航天、能源等领域从事机械设计、工艺设计、生产管理、研发等工作，是传统制造业的核心专业，就业稳定。",
    "hotScore": 82,
    "strongUniversities": [
      "tsinghua",
      "sjtu",
      "hit",
      "xju",
      "hust",
      "scut",
      "csu",
      "dlut"
    ],
    "officialCode": "080201"
  },
  {
    "id": "ee-auto",
    "name": "电气工程及其自动化",
    "category": "engineering",
    "description": "电气工程及其自动化专业主要研究电力系统、电机与电器、电力电子技术、自动控制等方面的理论与应用。核心课程包括电路理论、电机学、电力系统分析、电力电子技术、自动控制原理等。毕业生可在电力系统、电气设备制造、自动化企业、新能源等领域从事设计、研发、运行管理等工作，是电力行业的核心专业，就业稳定且待遇较好。",
    "hotScore": 85,
    "strongUniversities": [
      "tsinghua",
      "sjtu",
      "xju",
      "hit",
      "hust",
      "scut",
      "cqu",
      "hebut"
    ],
    "officialCode": "080601"
  },
  {
    "id": "comm",
    "name": "通信工程",
    "category": "engineering",
    "description": "通信工程专业主要研究通信系统、信号处理、无线通信、光通信等方面的理论与技术。核心课程包括通信原理、数字信号处理、移动通信、光纤通信、信息论等。毕业生可在通信运营商、通信设备厂商、互联网公司从事通信系统设计、网络优化、产品研发等工作，随着5G、6G技术的发展，该专业前景持续看好。",
    "hotScore": 89,
    "strongUniversities": [
      "xidian",
      "uestc",
      "bupt",
      "scut",
      "hust",
      "xju",
      "hit",
      "hdu"
    ],
    "officialCode": "080703"
  },
  {
    "id": "net",
    "name": "网络工程",
    "category": "engineering",
    "description": "网络工程专业主要研究计算机网络的设计、建设、管理与维护，涉及网络架构、网络安全、云计算、物联网等内容。核心课程包括计算机网络、网络协议、网络安全、网络管理、云计算技术等。毕业生可在互联网公司、电信运营商、企业IT部门从事网络工程师、系统架构师、网络安全工程师等工作，随着网络基础设施的不断发展，需求量大。",
    "hotScore": 86,
    "strongUniversities": [
      "xidian",
      "uestc",
      "bupt",
      "scut",
      "hust",
      "xiyou",
      "hdu"
    ],
    "officialCode": "080903"
  },
  {
    "id": "iot",
    "name": "物联网工程",
    "category": "engineering",
    "description": "物联网工程专业是计算机、通信、电子等多学科交叉的新兴专业，主要研究物联网系统的设计、开发与应用。核心课程包括物联网导论、传感器技术、嵌入式系统、无线传感器网络、物联网应用开发等。毕业生可在智能家居、智慧城市、工业互联网等领域从事物联网系统设计、产品开发、解决方案设计等工作，是未来智能化发展的重要方向。",
    "hotScore": 84,
    "strongUniversities": [
      "xidian",
      "uestc",
      "bupt",
      "scut",
      "hust",
      "xiyou",
      "hdu"
    ],
    "officialCode": "080905"
  },
  {
    "id": "infosec",
    "name": "信息安全",
    "category": "engineering",
    "description": "信息安全专业主要研究信息系统安全防护、密码学、网络安全、数据安全等方面的理论与技术。核心课程包括密码学、网络安全、信息系统安全、恶意代码分析、安全协议等。毕业生可在政府部门、金融机构、互联网公司、安全厂商从事信息安全工程师、安全分析师、渗透测试工程师等工作，随着网络安全威胁的加剧，该专业需求量大且薪资水平高。",
    "hotScore": 91,
    "strongUniversities": [
      "xidian",
      "uestc",
      "bupt",
      "scut",
      "hust",
      "xiyou",
      "hdu"
    ],
    "officialCode": "080904K"
  },
  {
    "id": "arch",
    "name": "建筑学",
    "category": "engineering",
    "description": "建筑学专业是技术与艺术相结合的专业，主要研究建筑设计、城市规划、建筑历史与理论等。核心课程包括建筑设计、建筑构造、建筑历史、城市规划原理、建筑物理等。学制通常为五年，需要较强的空间想象力和艺术素养。毕业生可在建筑设计院、房地产公司、规划部门从事建筑师、规划师等工作，是传统热门专业，就业稳定但需要较强的专业能力。",
    "hotScore": 80,
    "strongUniversities": [
      "tsinghua",
      "tongji",
      "seu",
      "xauat",
      "scut",
      "tju",
      "cqu"
    ],
    "officialCode": "082801"
  },
  {
    "id": "civil",
    "name": "土木工程",
    "category": "engineering",
    "description": "土木工程专业主要研究各类工程设施的规划、设计、施工与管理，包括建筑工程、道路桥梁、水利工程等方向。核心课程包括结构力学、材料力学、混凝土结构、钢结构、土力学、基础工程等。毕业生可在建筑公司、设计院、房地产公司、政府部门从事结构设计、施工管理、工程监理等工作，是基础设施建设的重要专业，就业面广。",
    "hotScore": 79,
    "strongUniversities": [
      "tongji",
      "seu",
      "tsinghua",
      "xauat",
      "scut",
      "tju",
      "cqu",
      "chd"
    ],
    "officialCode": "081001"
  },
  {
    "id": "materials",
    "name": "材料科学与工程",
    "category": "engineering",
    "description": "材料科学与工程专业主要研究材料的组成、结构、性能及其制备与应用，包括金属材料、无机非金属材料、高分子材料等方向。核心课程包括材料科学基础、材料物理、材料化学、材料力学性能、材料制备技术等。毕业生可在材料制造企业、科研院所、航空航天、汽车工业等领域从事材料研发、工艺设计、质量控制等工作，是制造业的基础专业。",
    "hotScore": 76,
    "strongUniversities": [
      "tsinghua",
      "ustb",
      "sjtu",
      "hit",
      "scut",
      "csu",
      "suda"
    ],
    "officialCode": "080401"
  },
  {
    "id": "chem-eng",
    "name": "化学工程与工艺",
    "category": "engineering",
    "description": "化学工程与工艺专业主要研究化工过程的设计、优化与控制，涉及化学反应工程、分离工程、化工热力学等内容。核心课程包括化工原理、化学反应工程、化工热力学、化工设计、化工安全等。毕业生可在化工、石油、制药、环保等行业从事工艺设计、生产管理、技术研发等工作，是传统化工行业的核心专业。",
    "hotScore": 75,
    "strongUniversities": [
      "tju",
      "buct",
      "dlut",
      "scut",
      "suda",
      "jiangnan",
      "tyut"
    ],
    "officialCode": "081301"
  },
  {
    "id": "bme",
    "name": "生物医学工程",
    "category": "engineering",
    "description": "生物医学工程是工程学与医学、生物学交叉的新兴专业，主要研究医疗设备、生物材料、医学影像、生物信息等方面的技术。核心课程包括生物医学信号处理、医学影像技术、生物材料、生物力学、医疗器械设计等。毕业生可在医疗器械公司、医院、科研院所从事医疗设备研发、医学影像技术、生物材料研究等工作，是医疗科技发展的重要方向。",
    "hotScore": 81,
    "strongUniversities": [
      "tsinghua",
      "seu",
      "sjtu",
      "zju",
      "scut",
      "uestc",
      "hust",
      "ustc",
      "hit"
    ],
    "officialCode": "082601"
  },
  {
    "id": "stats",
    "name": "统计学",
    "category": "science",
    "description": "统计学专业主要研究数据的收集、整理、分析和解释，是现代数据科学的重要基础。核心课程包括概率论、数理统计、统计推断、回归分析、时间序列分析、多元统计分析等。毕业生可在金融、保险、互联网、咨询、政府部门从事数据分析、风险评估、市场研究等工作，随着大数据时代的到来，该专业需求量大、应用面广。",
    "hotScore": 88,
    "strongUniversities": [
      "ruc",
      "xmu",
      "ecnu",
      "swufe",
      "cufe",
      "xmu",
      "nwnu"
    ],
    "officialCode": "071201"
  },
  {
    "id": "app-physics",
    "name": "应用物理学",
    "category": "science",
    "description": "应用物理学专业在物理学基础上，注重物理原理在实际中的应用，包括光电子、半导体、凝聚态物理等方向。核心课程包括理论物理、固体物理、半导体物理、光电子技术、激光原理等。毕业生可在电子、通信、材料、能源等领域从事研发工作，也可以继续深造从事科研，是连接基础科学与应用技术的桥梁专业。",
    "hotScore": 74,
    "strongUniversities": [
      "pku",
      "tsinghua",
      "ustc",
      "nju",
      "zju",
      "hit",
      "sdu"
    ],
    "officialCode": "070202"
  },
  {
    "id": "chemistry",
    "name": "化学",
    "category": "science",
    "description": "化学专业主要研究物质的组成、结构、性质及其变化规律，包括无机化学、有机化学、物理化学、分析化学等方向。核心课程包括无机化学、有机化学、物理化学、分析化学、结构化学等。毕业生可在化工、制药、材料、环保、食品等行业从事研发、分析检测、质量控制等工作，也可以继续深造从事科研，是基础学科中的重要专业。",
    "hotScore": 72,
    "strongUniversities": [
      "pku",
      "nju",
      "fudan",
      "ustc",
      "zju",
      "sdu",
      "nankai"
    ],
    "officialCode": "070301"
  },
  {
    "id": "biology",
    "name": "生物科学",
    "category": "science",
    "description": "生物科学专业主要研究生命现象及其规律，包括分子生物学、细胞生物学、遗传学、生态学等方向。核心课程包括生物化学、细胞生物学、遗传学、分子生物学、生态学等。毕业生可在生物技术公司、制药企业、科研院所、环保部门从事研发、检测、管理等工作，也可以继续深造从事科研，是生命科学领域的基础专业。",
    "hotScore": 73,
    "strongUniversities": [
      "pku",
      "tsinghua",
      "fudan",
      "zju",
      "sysu",
      "scu",
      "ccnu"
    ],
    "officialCode": "071001"
  },
  {
    "id": "ics",
    "name": "信息与计算科学",
    "category": "science",
    "description": "信息与计算科学专业是数学与计算机科学交叉的专业，主要研究信息处理与科学计算的理论与方法。核心课程包括数学分析、高等代数、概率论、数值分析、数据结构、算法设计等。毕业生可在金融、互联网、科研院所从事算法开发、数据分析、科学计算等工作，既有扎实的数学基础，又具备编程能力，就业面广。",
    "hotScore": 83,
    "strongUniversities": [
      "pku",
      "tsinghua",
      "zju",
      "nju",
      "ustc",
      "ruc",
      "sdu"
    ],
    "officialCode": "070102"
  },
  {
    "id": "economics",
    "name": "经济学",
    "category": "arts",
    "description": "经济学专业主要研究经济运行规律、资源配置、市场机制等经济理论，包括微观经济学、宏观经济学、计量经济学等方向。核心课程包括政治经济学、微观经济学、宏观经济学、计量经济学、国际经济学等。毕业生可在金融机构、政府部门、企业、咨询公司从事经济分析、政策研究、投资分析等工作，是社会科学中的热门专业。",
    "hotScore": 87,
    "strongUniversities": [
      "ruc",
      "pku",
      "fudan",
      "xmu",
      "swufe",
      "cufe",
      "uibe"
    ],
    "officialCode": "020101"
  },
  {
    "id": "finance",
    "name": "金融学",
    "category": "arts",
    "description": "金融学专业主要研究货币、银行、证券、保险等金融领域的理论与实务，包括货币银行学、证券投资、保险学、国际金融等方向。核心课程包括金融学、投资学、商业银行经营学、国际金融、金融工程等。毕业生可在银行、证券公司、保险公司、基金公司、投资公司从事金融分析、投资管理、风险管理等工作，是财经类专业中最热门的专业之一，就业前景好、薪资水平高。",
    "hotScore": 93,
    "strongUniversities": [
      "ruc",
      "cufe",
      "swufe",
      "uibe",
      "fudan",
      "xmu",
      "cufe"
    ],
    "officialCode": "020301K"
  },
  {
    "id": "accounting",
    "name": "会计学",
    "category": "arts",
    "description": "会计学专业主要研究会计理论、财务管理、审计等方面的知识，培养具备会计核算、财务分析、审计等能力的人才。核心课程包括会计学原理、中级财务会计、高级财务会计、财务管理、审计学、税法等。毕业生可在会计师事务所、企业财务部门、金融机构、政府部门从事会计、审计、财务管理等工作，是传统热门专业，就业稳定。",
    "hotScore": 88,
    "strongUniversities": [
      "cufe",
      "swufe",
      "ruc",
      "uibe",
      "xmu",
      "nankai"
    ],
    "officialCode": "120203K"
  },
  {
    "id": "business",
    "name": "工商管理",
    "category": "arts",
    "description": "工商管理专业主要研究企业管理、市场营销、人力资源、战略管理等管理理论与方法。核心课程包括管理学、市场营销、人力资源管理、财务管理、战略管理、运营管理等。毕业生可在各类企业从事管理、营销、人力资源、咨询等工作，也可以自主创业，是培养管理人才的重要专业，就业面广但需要较强的综合能力。",
    "hotScore": 85,
    "strongUniversities": [
      "tsinghua",
      "pku",
      "ruc",
      "fudan",
      "sjtu",
      "zju",
      "swufe"
    ],
    "officialCode": "120201K"
  },
  {
    "id": "journalism",
    "name": "新闻学",
    "category": "arts",
    "description": "新闻学主要研究新闻事实的发现、核实、采写和传播，关注公共信息的真实性及其社会影响。通常学习采访写作、新闻编辑、新闻评论、传播学和新闻伦理法规，并通过采访实践、事实核查及多媒体报道训练信息判断与表达能力。所学知识可用于新闻采编、媒体策划、内容生产和机构传播等领域，具体培养方向因学校而异。",
    "hotScore": 82,
    "strongUniversities": [
      "cuc",
      "fudan",
      "ruc",
      "bfsu",
      "whu",
      "sysu",
      "xisu",
      "xmu"
    ],
    "officialCode": "050301"
  },
  {
    "id": "english",
    "name": "英语",
    "category": "arts",
    "description": "英语专业主要研究英语语言、文学、文化，培养具备英语听说读写译能力的人才。核心课程包括综合英语、英语阅读、英语写作、翻译理论与实践、英美文学、语言学概论等。毕业生可在教育、外贸、翻译、旅游、外企等领域从事英语教师、翻译、外贸业务员、国际交流等工作，是传统外语专业，就业面广但需要较强的语言能力。",
    "hotScore": 80,
    "strongUniversities": [
      "bfsu",
      "shisu",
      "xisu",
      "fudan",
      "nju",
      "sysu",
      "ecnu"
    ],
    "officialCode": "050201"
  },
  {
    "id": "iet",
    "name": "国际经济与贸易",
    "category": "arts",
    "description": "国际经济与贸易专业主要研究国际贸易理论、政策与实务，培养具备国际贸易操作能力的人才。核心课程包括国际贸易理论、国际贸易实务、国际金融、国际商法、外贸英语函电等。毕业生可在外贸公司、跨国公司、金融机构、政府部门从事国际贸易、国际商务、外贸业务等工作，随着全球化发展，该专业仍有较好的就业前景。",
    "hotScore": 84,
    "strongUniversities": [
      "uibe",
      "fudan",
      "ruc",
      "swufe",
      "cufe",
      "xmu"
    ],
    "officialCode": "020401"
  },
  {
    "id": "psychology",
    "name": "心理学",
    "category": "science",
    "description": "心理学专业主要研究人类心理现象及其规律，包括认知心理学、发展心理学、社会心理学、应用心理学等方向。核心课程包括普通心理学、实验心理学、发展心理学、社会心理学、心理统计、心理测量等。毕业生可在教育、医疗、企业、咨询等领域从事心理咨询、人力资源、市场研究、用户体验等工作，随着心理健康关注度提高，该专业需求增长。",
    "hotScore": 86,
    "strongUniversities": [
      "bnu",
      "ecnu",
      "hustc",
      "pku",
      "ruc",
      "swu",
      "snnu"
    ],
    "officialCode": "071101"
  },
  {
    "id": "env-eng",
    "name": "环境工程",
    "category": "engineering",
    "description": "环境工程专业主要研究环境污染防治、环境质量改善、废物处理与资源化利用等理论与技术。核心课程包括环境工程原理、水污染控制工程、大气污染控制工程、固体废物处理与处置、环境监测、环境评价等。毕业生可在环保部门、设计院、环保企业、科研院所从事环境工程设计、环境监测、污染治理、环境管理等工作，随着环保意识的提高，该专业需求持续增长。",
    "hotScore": 77,
    "strongUniversities": [
      "tsinghua",
      "tongji",
      "hhu",
      "scut",
      "hit",
      "sjtu",
      "nju",
      "pku",
      "tju",
      "buct",
      "zju"
    ],
    "officialCode": "082502"
  },
  {
    "id": "energy-power",
    "name": "能源与动力工程",
    "category": "engineering",
    "description": "能源与动力工程专业主要研究能源转换、利用与管理，涉及热能工程、动力机械、新能源技术等方向。核心课程包括工程热力学、传热学、流体力学、燃烧学、汽轮机原理、锅炉原理等。毕业生可在电力、能源、机械、汽车等行业从事能源系统设计、动力设备研发、新能源技术开发等工作，是能源行业的重要专业。",
    "hotScore": 78,
    "strongUniversities": [
      "tsinghua",
      "sjtu",
      "xju",
      "hit",
      "hust",
      "scut",
      "tju",
      "seu",
      "zju"
    ],
    "officialCode": "080501"
  },
  {
    "id": "aerospace",
    "name": "航空航天工程",
    "category": "engineering",
    "description": "航空航天工程专业主要研究飞行器设计、制造、运行与控制，包括飞机工程、航天器工程、推进系统等方向。核心课程包括飞行器设计、空气动力学、飞行器结构力学、飞行器制造工艺、飞行器控制系统等。毕业生可在航空航天院所、航空公司、国防工业从事飞行器设计、制造、测试、维护等工作，是国家战略需求的重要专业。",
    "hotScore": 83,
    "strongUniversities": [
      "buaa",
      "nuaa",
      "nwpu",
      "hit",
      "tsinghua",
      "sjtu",
      "hust",
      "beihang",
      "nudt"
    ],
    "officialCode": "082001"
  },
  {
    "id": "nuclear",
    "name": "核工程与核技术",
    "category": "engineering",
    "description": "核工程与核技术专业主要研究核能利用、核技术应用、核安全等方面的理论与技术。核心课程包括核物理、反应堆物理、核反应堆工程、辐射防护、核安全等。毕业生可在核电站、核工业部门、科研院所、医疗设备公司从事核工程设计、运行管理、辐射防护、核技术应用等工作，是核能行业的核心专业。",
    "hotScore": 70,
    "strongUniversities": [
      "tsinghua",
      "hit",
      "sjtu",
      "cqu",
      "scut",
      "xju",
      "scu",
      "swust"
    ],
    "officialCode": "082201"
  },
  {
    "id": "optics",
    "name": "光电信息科学与工程",
    "category": "engineering",
    "description": "光电信息科学与工程专业是光学、电子、信息科学交叉的新兴专业，主要研究光电信息获取、传输、处理与应用。核心课程包括物理光学、应用光学、激光原理与技术、光电检测技术、光通信技术、光电子器件等。毕业生可在光通信、激光技术、光电子、光学仪器等领域从事研发、设计、制造等工作，是光电子产业的重要专业。",
    "hotScore": 79,
    "strongUniversities": [
      "hit",
      "zju",
      "tsinghua",
      "seu",
      "xatu",
      "sjtu",
      "xju",
      "uestc",
      "scut"
    ],
    "officialCode": "080705"
  },
  {
    "id": "vehicle",
    "name": "车辆工程",
    "category": "engineering",
    "description": "车辆工程专业主要研究汽车、摩托车等机动车辆的设计、制造、测试与维护。核心课程包括汽车构造、汽车理论、汽车设计、汽车制造工艺、发动机原理、汽车电子技术等。毕业生可在汽车制造企业、汽车零部件企业、汽车研究院所从事车辆设计、制造、测试、管理等工作，随着新能源汽车的发展，该专业前景广阔。",
    "hotScore": 81,
    "strongUniversities": [
      "tsinghua",
      "jlu",
      "hit",
      "sjtu",
      "scut",
      "hust",
      "cqu",
      "tongji",
      "nefu"
    ],
    "officialCode": "080207"
  },
  {
    "id": "ship",
    "name": "船舶与海洋工程",
    "category": "engineering",
    "description": "船舶与海洋工程专业主要研究船舶设计、制造、海洋平台建设等理论与技术。核心课程包括船舶静力学、船舶动力学、船舶结构力学、船舶设计原理、海洋工程等。毕业生可在船舶制造企业、海洋工程公司、设计院、船级社从事船舶设计、制造、检验、管理等工作，是国家海洋战略的重要支撑专业。",
    "hotScore": 73,
    "strongUniversities": [
      "sjtu",
      "hit",
      "dlut",
      "tju",
      "scut"
    ],
    "officialCode": "081901"
  },
  {
    "id": "food-eng",
    "name": "食品科学与工程",
    "category": "engineering",
    "description": "食品科学与工程专业主要研究食品的加工、贮藏、安全检测与质量控制。核心课程包括食品化学、食品微生物学、食品工艺学、食品营养学、食品安全、食品分析等。毕业生可在食品企业、质检部门、科研院所从事食品研发、质量控制、食品安全检测、生产管理等工作，是食品行业的重要专业。",
    "hotScore": 74,
    "strongUniversities": [
      "cau",
      "scut",
      "jiangnan",
      "zju",
      "nwafu",
      "sysu",
      "suda",
      "whu"
    ],
    "officialCode": "082701"
  },
  {
    "id": "textile",
    "name": "纺织工程",
    "category": "engineering",
    "description": "纺织工程专业主要研究纺织材料、纺织工艺、纺织品设计等方面的理论与技术。核心课程包括纺织材料学、纺纱学、织造学、染整工艺、纺织品设计、纺织品检测等。毕业生可在纺织企业、服装企业、质检部门从事纺织工艺设计、产品开发、质量控制等工作，是传统制造业的重要专业。",
    "hotScore": 68,
    "strongUniversities": [
      "scut",
      "suda",
      "tianjin-poly",
      "xpu",
      "donghua"
    ],
    "officialCode": "081601"
  },
  {
    "id": "mining",
    "name": "采矿工程",
    "category": "engineering",
    "description": "采矿工程专业主要研究矿产资源开采的理论、方法与技术，包括金属矿、非金属矿、煤炭等的开采。核心课程包括采矿学、矿山压力与岩层控制、矿井通风、矿山安全、采矿机械等。毕业生可在矿山企业、设计院、科研院所从事采矿设计、生产管理、安全监测等工作，是矿业的重要专业。",
    "hotScore": 65,
    "strongUniversities": [
      "csu",
      "cqu",
      "xust",
      "ustb",
      "cumt",
      "cug",
      "csm",
      "nepu"
    ],
    "officialCode": "081501"
  },
  {
    "id": "petroleum",
    "name": "石油工程",
    "category": "engineering",
    "description": "石油工程专业主要研究石油与天然气的勘探、开发、生产与管理。核心课程包括油藏工程、钻井工程、采油工程、油层物理、石油地质学等。毕业生可在石油公司、油田企业、设计院从事石油勘探开发、钻井采油、油气田管理等工作，是能源行业的重要专业。",
    "hotScore": 71,
    "strongUniversities": [
      "cup",
      "cupw",
      "swpu",
      "nepu",
      "cupi"
    ],
    "officialCode": "081502"
  },
  {
    "id": "transport",
    "name": "交通运输",
    "category": "engineering",
    "description": "交通运输专业主要研究交通运输系统的规划、设计、运营与管理，包括道路、铁路、航空、水路等运输方式。核心课程包括交通运输规划、交通工程、运输组织学、交通管理与控制、物流工程等。毕业生可在交通部门、物流企业、设计院从事交通规划、运输管理、物流运作等工作，是交通运输行业的重要专业。",
    "hotScore": 76,
    "strongUniversities": [
      "tongji",
      "swjtu",
      "chd",
      "seu",
      "bjtu",
      "dlufl"
    ],
    "officialCode": "081801"
  },
  {
    "id": "water-conservancy",
    "name": "水利水电工程",
    "category": "engineering",
    "description": "水利水电工程专业主要研究水资源的开发利用、水电站建设、水利工程建设等方面的理论与技术。核心课程包括水力学、水文学、水工建筑物、水电站、水利工程施工等。毕业生可在水利部门、水电企业、设计院从事水利工程设计、施工管理、运行维护等工作，是国家基础设施建设的重要专业。",
    "hotScore": 72,
    "strongUniversities": [
      "hhu",
      "tsinghua",
      "wuhan",
      "sichuan",
      "tianjin"
    ],
    "officialCode": "081101"
  },
  {
    "id": "printing",
    "name": "印刷工程",
    "category": "engineering",
    "description": "印刷工程专业主要研究印刷技术、印刷材料、印刷设备等方面的理论与应用。核心课程包括印刷原理与工艺、印刷材料学、印刷设备、色彩学、图像处理等。毕业生可在印刷企业、出版社、广告公司从事印刷工艺设计、质量控制、设备管理等工作，是文化传媒行业的重要专业。",
    "hotScore": 62,
    "strongUniversities": [
      "bjfu",
      "scut",
      "tianjin-science",
      "hunan",
      "wuhan",
      "bjigl"
    ],
    "officialCode": "081703"
  },
  {
    "id": "packaging",
    "name": "包装工程",
    "category": "engineering",
    "description": "包装工程专业主要研究包装材料、包装设计、包装工艺等方面的理论与技术。核心课程包括包装材料学、包装结构设计、包装工艺学、包装机械、包装测试等。毕业生可在包装企业、物流企业、食品企业从事包装设计、包装工艺、包装材料研发等工作，是现代物流和商品流通的重要专业。",
    "hotScore": 64,
    "strongUniversities": [
      "scut",
      "tianjin-tech",
      "jiangnan",
      "bjfu",
      "jnu",
      "hust",
      "whut"
    ],
    "officialCode": "081702"
  },
  {
    "id": "applied-chem",
    "name": "应用化学",
    "category": "science",
    "description": "应用化学专业在化学基础上，注重化学原理在实际生产中的应用，包括精细化工、材料化学、环境化学等方向。核心课程包括无机化学、有机化学、物理化学、分析化学、化工原理、精细化学品化学等。毕业生可在化工、材料、制药、环保等行业从事研发、分析检测、工艺设计等工作，是连接化学理论与应用的重要专业。",
    "hotScore": 71,
    "strongUniversities": [
      "pku",
      "nju",
      "fudan",
      "ustc",
      "zju",
      "sdu",
      "nankai",
      "tju",
      "buct"
    ],
    "officialCode": "070302"
  },
  {
    "id": "biotechnology",
    "name": "生物技术",
    "category": "science",
    "description": "生物技术专业主要研究利用生物体或其组成部分进行产品开发和技术应用，包括基因工程、细胞工程、发酵工程、酶工程等。核心课程包括生物化学、分子生物学、细胞生物学、微生物学、基因工程、发酵工程等。毕业生可在生物技术公司、制药企业、科研院所从事生物技术研发、产品开发、技术应用等工作，是生物产业的重要基础专业。",
    "hotScore": 75,
    "strongUniversities": [
      "pku",
      "tsinghua",
      "fudan",
      "zju",
      "sysu",
      "scu",
      "ccnu",
      "nju"
    ],
    "officialCode": "071002"
  },
  {
    "id": "geology",
    "name": "地质学",
    "category": "science",
    "description": "地质学专业主要研究地球的物质组成、结构构造、演化历史及地质作用过程。核心课程包括普通地质学、矿物学、岩石学、构造地质学、古生物学、地球化学等。毕业生可在地质部门、矿业企业、科研院所从事地质调查、矿产勘查、环境地质等工作，是资源勘查和环境保护的重要专业。",
    "hotScore": 69,
    "strongUniversities": [
      "cugb",
      "cug",
      "jilin",
      "nwpu",
      "pku",
      "nju",
      "ustc"
    ],
    "officialCode": "070901"
  },
  {
    "id": "geophysics",
    "name": "地球物理学",
    "category": "science",
    "description": "地球物理学专业主要研究地球的物理性质、物理过程和物理现象，包括地震学、重力学、地磁学、地电学等。核心课程包括地球物理学基础、地震学、重力学、地磁学、地电学、地球物理勘探等。毕业生可在石油、矿产、地震等部门从事地球物理勘探、地震监测、地质灾害评估等工作，是资源勘查和防灾减灾的重要专业。",
    "hotScore": 67,
    "strongUniversities": [
      "pku",
      "ustc",
      "cugb",
      "cug",
      "tongji",
      "nju",
      "hit"
    ],
    "officialCode": "070801"
  },
  {
    "id": "atmospheric",
    "name": "大气科学",
    "category": "science",
    "description": "大气科学专业主要研究大气的物理、化学和动力过程，包括天气学、气候学、大气物理学、大气化学等。核心课程包括大气物理学、天气学、气候学、动力气象学、大气化学、数值天气预报等。毕业生可在气象部门、环保部门、航空部门从事天气预报、气候分析、大气环境监测等工作，是气象和环境科学的重要专业。",
    "hotScore": 68,
    "strongUniversities": [
      "nju",
      "lzu",
      "pku",
      "nudt",
      "cams"
    ],
    "officialCode": "070601"
  },
  {
    "id": "oceanography",
    "name": "海洋科学",
    "category": "science",
    "description": "海洋科学专业主要研究海洋的物理、化学、生物和地质过程，包括物理海洋学、化学海洋学、生物海洋学、海洋地质学等。核心课程包括海洋学导论、物理海洋学、化学海洋学、生物海洋学、海洋地质学等。毕业生可在海洋部门、科研院所、海洋企业从事海洋调查、海洋资源开发、海洋环境保护等工作，是国家海洋战略的重要支撑专业。",
    "hotScore": 70,
    "strongUniversities": [
      "ouc",
      "xmu",
      "tju",
      "hhu",
      "tongji",
      "sdust",
      "sdu"
    ],
    "officialCode": "070701"
  },
  {
    "id": "ecology",
    "name": "生态学",
    "category": "science",
    "description": "生态学专业主要研究生物与环境之间的相互关系，包括个体生态学、种群生态学、群落生态学、生态系统生态学等。核心课程包括普通生态学、植物生态学、动物生态学、生态系统生态学、景观生态学、保护生物学等。毕业生可在环保部门、科研院所、自然保护区从事生态调查、生态修复、环境保护等工作，是生态文明建设的重要专业。",
    "hotScore": 72,
    "strongUniversities": [
      "pku",
      "sysu",
      "xmu",
      "lzu",
      "ecnu",
      "nwafu",
      "nankai",
      "fudan",
      "scu"
    ],
    "officialCode": "071004"
  },
  {
    "id": "geography",
    "name": "地理科学",
    "category": "science",
    "description": "地理科学专业主要研究地球表层系统的自然和人文要素及其相互作用，包括自然地理学、人文地理学、地理信息科学等。核心课程包括自然地理学、人文地理学、地理信息系统、遥感原理与应用、区域地理等。毕业生可在规划部门、国土部门、环境部门、科研院所从事地理调查、区域规划、地理信息系统应用等工作，是区域发展和规划的重要专业。",
    "hotScore": 73,
    "strongUniversities": [
      "pku",
      "nju",
      "bnu",
      "ecnu",
      "lzu",
      "ccnu",
      "nnu",
      "scnu",
      "xmu",
      "nwu",
      "nankai"
    ],
    "officialCode": "070501"
  },
  {
    "id": "astronomy",
    "name": "天文学",
    "category": "science",
    "description": "天文学专业主要研究天体的结构、演化和运动规律，包括天体物理、天体测量、天体力学等。核心课程包括普通天文学、天体物理学、天体测量学、天体力学、恒星物理、星系物理等。毕业生可在天文台、科研院所、高校从事天文观测、天体物理研究、天文科普等工作，是基础科学的重要分支。",
    "hotScore": 66,
    "strongUniversities": [
      "nju",
      "pku",
      "ustc",
      "tsinghua",
      "xfu",
      "yau"
    ],
    "officialCode": "070401"
  },
  {
    "id": "psychology-sci",
    "name": "应用心理学",
    "category": "science",
    "description": "应用心理学专业在心理学基础上，注重心理学理论在实际领域的应用，包括教育心理学、临床心理学、管理心理学、工程心理学等。核心课程包括普通心理学、实验心理学、心理统计、心理测量、心理咨询、心理治疗等。毕业生可在教育、医疗、企业、咨询等领域从事心理咨询、心理评估、人力资源管理、用户体验设计等工作。",
    "hotScore": 77,
    "strongUniversities": [
      "bnu",
      "ecnu",
      "hustc",
      "pku",
      "ruc",
      "swu"
    ],
    "officialCode": "071102"
  },
  {
    "id": "bioinformatics",
    "name": "生物信息学",
    "category": "science",
    "description": "生物信息学专业是生物学、计算机科学和数学交叉的新兴专业，主要研究生物大数据的处理、分析和应用。核心课程包括生物学、计算机科学、数据结构与算法、生物信息学算法、基因组学、蛋白质组学等。毕业生可在生物技术公司、制药企业、科研院所从事生物数据分析、基因序列分析、药物设计等工作，是生命科学研究的重要工具专业。",
    "hotScore": 78,
    "strongUniversities": [
      "pku",
      "tsinghua",
      "fudan",
      "zju",
      "sysu",
      "scu"
    ],
    "officialCode": "071003"
  },
  {
    "id": "geography-info",
    "name": "地理信息科学",
    "category": "science",
    "description": "地理信息科学专业主要研究地理信息的获取、存储、处理、分析和应用，包括地理信息系统、遥感技术、全球定位系统等。核心课程包括地理信息系统原理、遥感原理与应用、GPS原理与应用、空间数据库、数字图像处理等。毕业生可在国土、规划、环境、测绘等部门从事地理信息系统开发、遥感应用、空间数据分析等工作，是地理信息技术应用的重要专业。",
    "hotScore": 76,
    "strongUniversities": [
      "pku",
      "nju",
      "wuhan",
      "tongji",
      "ecnu"
    ],
    "officialCode": "070504"
  },
  {
    "id": "materials-physics",
    "name": "材料物理",
    "category": "engineering",
    "description": "材料物理专业主要研究材料的物理性质和物理过程，包括材料的电子结构、磁性、光学性质、相变等。核心课程包括固体物理、材料物理、材料科学基础、材料表征技术、材料物理性能等。毕业生可在材料企业、科研院所从事材料研究、性能测试、新材料开发等工作，是材料科学的重要基础专业。",
    "hotScore": 74,
    "strongUniversities": [
      "pku",
      "ustc",
      "tsinghua",
      "nju",
      "fudan"
    ],
    "officialCode": "080402"
  },
  {
    "id": "history",
    "name": "历史学",
    "category": "arts",
    "description": "历史学专业主要研究人类社会的历史发展过程，包括中国史、世界史、考古学等方向。核心课程包括中国古代史、中国近现代史、世界古代史、世界近现代史、史学理论、史学方法等。毕业生可在高校、中学、科研院所、博物馆、档案馆从事历史教学、历史研究、文物管理等工作，也可以从事编辑、记者、公务员等工作。",
    "hotScore": 75,
    "strongUniversities": [
      "pku",
      "nju",
      "fudan",
      "nku",
      "bnu",
      "whu",
      "ecnu"
    ],
    "officialCode": "060101"
  },
  {
    "id": "philosophy",
    "name": "哲学",
    "category": "arts",
    "description": "哲学专业主要研究世界观、方法论、认识论等基本哲学问题，包括马克思主义哲学、中国哲学、西方哲学、逻辑学等。核心课程包括马克思主义哲学原理、中国哲学史、西方哲学史、逻辑学、伦理学、美学等。毕业生可在高校、科研院所从事哲学教学和研究，也可以从事编辑、公务员、企业管理等工作，是培养思辨能力和理论素养的重要专业。",
    "hotScore": 71,
    "strongUniversities": [
      "pku",
      "fudan",
      "nju",
      "ruc",
      "zju",
      "whu"
    ],
    "officialCode": "010101"
  },
  {
    "id": "sociology",
    "name": "社会学",
    "category": "arts",
    "description": "社会学专业主要研究社会结构、社会关系、社会变迁等社会现象和规律。核心课程包括社会学概论、社会研究方法、社会统计学、社会心理学、社会分层、社会变迁等。毕业生可在政府部门、社会组织、企业、科研院所从事社会调查、社会政策研究、社会服务、市场研究等工作，是理解社会的重要专业。",
    "hotScore": 76,
    "strongUniversities": [
      "ruc",
      "pku",
      "fudan",
      "nju",
      "whu",
      "ecnu",
      "nankai",
      "sysu"
    ],
    "officialCode": "030301"
  },
  {
    "id": "politics",
    "name": "政治学与行政学",
    "category": "arts",
    "description": "政治学与行政学专业主要研究政治现象、政治制度、公共行政等理论和实践问题。核心课程包括政治学原理、中国政治制度史、比较政治制度、公共行政学、公共政策学等。毕业生可在政府部门、事业单位、企业从事行政管理、政策研究、公共事务管理等工作，也可以从事教学和研究工作，是培养公共管理人才的重要专业。",
    "hotScore": 74,
    "strongUniversities": [
      "ruc",
      "pku",
      "fudan",
      "nju",
      "nku",
      "whu"
    ],
    "officialCode": "030201"
  },
  {
    "id": "international-relations",
    "name": "国际政治",
    "category": "arts",
    "description": "国际政治研究国家关系、国际组织、外交政策及全球治理中的政治问题。通常学习政治学、国际关系理论、国际政治史、国际组织和研究方法，并通过政策分析、文献阅读及专题研究训练比较分析与跨文化理解能力。所学知识可用于国际事务分析、公共政策研究、涉外交流和国际组织相关工作，具体课程侧重点因学校而异。",
    "hotScore": 77,
    "strongUniversities": [
      "fudan",
      "pku",
      "ruc",
      "tsinghua",
      "nku"
    ],
    "officialCode": "030202"
  },
  {
    "id": "education",
    "name": "教育学",
    "category": "arts",
    "description": "教育学专业主要研究教育现象、教育规律、教育方法等教育理论和实践问题。核心课程包括教育学原理、教育心理学、中外教育史、课程与教学论、教育研究方法等。毕业生可在高校、中小学、教育行政部门、教育研究机构从事教育管理、教学、教育研究等工作，是培养教育人才的基础专业。",
    "hotScore": 81,
    "strongUniversities": [
      "bnu",
      "ecnu",
      "hustc",
      "snnu",
      "nwnu",
      "swu"
    ],
    "officialCode": "040101"
  },
  {
    "id": "chinese-education",
    "name": "汉语国际教育",
    "category": "arts",
    "description": "汉语国际教育专业主要培养对外汉语教学人才，研究汉语作为第二语言的教学理论和方法。核心课程包括现代汉语、古代汉语、语言学概论、对外汉语教学概论、跨文化交际、中国文化等。毕业生可在国内外从事对外汉语教学、文化交流、国际教育等工作，随着汉语国际推广，该专业需求持续增长。",
    "hotScore": 78,
    "strongUniversities": [
      "bfsu",
      "bnu",
      "ecnu",
      "fudan",
      "nju",
      "xisu"
    ],
    "officialCode": "050103"
  },
  {
    "id": "japanese",
    "name": "日语",
    "category": "arts",
    "description": "日语专业主要研究日语语言、文学、文化，培养具备日语听说读写译能力的人才。核心课程包括基础日语、高级日语、日语阅读、日语写作、翻译理论与实践、日本文学、日本文化等。毕业生可在教育、外贸、翻译、旅游、日企等领域从事日语教学、翻译、外贸业务、国际交流等工作。",
    "hotScore": 72,
    "strongUniversities": [
      "bfsu",
      "dlufl",
      "shisu",
      "xisu",
      "nju",
      "fudan"
    ],
    "officialCode": "050207"
  },
  {
    "id": "advertising",
    "name": "广告学",
    "category": "arts",
    "description": "广告学专业主要研究广告理论、广告策划、广告创意、广告设计等广告理论和实践。核心课程包括广告学概论、广告策划、广告创意、广告文案写作、广告设计、市场营销等。毕业生可在广告公司、媒体、企业营销部门从事广告策划、创意设计、品牌传播、市场营销等工作，是现代营销传播的重要专业。",
    "hotScore": 80,
    "strongUniversities": [
      "cuc",
      "fudan",
      "ruc",
      "xmu",
      "sysu",
      "whu"
    ],
    "officialCode": "050303"
  },
  {
    "id": "tourism",
    "name": "旅游管理",
    "category": "arts",
    "description": "旅游管理专业主要研究旅游业的发展规律、旅游企业管理、旅游规划与开发等。核心课程包括旅游学概论、旅游经济学、旅游规划与开发、酒店管理、旅行社管理、旅游市场营销等。毕业生可在旅游企业、酒店、景区、旅游行政部门从事旅游规划、旅游管理、旅游营销、酒店管理等工作，是旅游产业的重要专业。",
    "hotScore": 73,
    "strongUniversities": [
      "zju",
      "nku",
      "dongbei",
      "beijing",
      "shanghai",
      "xmu"
    ],
    "officialCode": "120901K"
  },
  {
    "id": "clinical-medicine",
    "name": "临床医学",
    "category": "medicine",
    "description": "临床医学专业是培养临床医生的核心专业，主要学习人体解剖学、生理学、病理学、药理学、诊断学、内科学、外科学、妇产科学、儿科学等基础医学和临床医学知识。学生需要掌握疾病的诊断、治疗和预防方法，具备良好的医德医风和临床技能。毕业后可从事临床医生、医学研究、医学教育等工作，是医学领域最核心、需求量最大的专业之一。",
    "hotScore": 96,
    "strongUniversities": [
      "pku",
      "sjtu",
      "zju",
      "fudan",
      "cmu",
      "scu",
      "afmu"
    ],
    "officialCode": "100201K"
  },
  {
    "id": "stomatology",
    "name": "口腔医学",
    "category": "medicine",
    "description": "口腔医学专业主要研究口腔及颌面部疾病的诊断、治疗和预防，涵盖口腔内科、口腔外科、口腔修复、口腔正畸、口腔预防保健等领域。核心课程包括口腔解剖生理学、口腔病理学、牙体牙髓病学、牙周病学、口腔颌面外科学等。毕业生可从事口腔医生、口腔医学研究等工作，随着人们对口腔健康重视程度的提高，可探索多种应用方向。",
    "hotScore": 88,
    "strongUniversities": [
      "pku",
      "sjtu",
      "scu",
      "cmu",
      "afmu"
    ],
    "officialCode": "100301K"
  },
  {
    "id": "preventive-medicine",
    "name": "预防医学",
    "category": "medicine",
    "description": "预防医学研究疾病在人群中的分布、危险因素及预防措施，关注个体健康与公共卫生之间的联系。通常学习基础医学、流行病学、卫生统计学、环境卫生、职业卫生和营养与食品卫生，并通过人群调查、统计分析及卫生实践训练识别和评价健康问题的能力。所学知识可用于疾病预防、健康风险评估、公共卫生管理和卫生研究等领域。",
    "hotScore": 82,
    "strongUniversities": [
      "pku",
      "fudan",
      "sjtu",
      "zju",
      "cmu",
      "scu"
    ],
    "officialCode": "100401K"
  },
  {
    "id": "traditional-chinese-medicine",
    "name": "中医学",
    "category": "medicine",
    "description": "中医学专业传承和发展中医理论和诊疗技术，学习中医基础理论、中医诊断学、中药学、方剂学、中医内科学、中医外科学、针灸推拿学等内容。该专业强调整体观念和辨证论治，培养能够运用中医药理论和方法诊疗疾病的中医医生。毕业生可在中医院、综合医院中医科、中医药科研院所等单位工作。",
    "hotScore": 85,
    "strongUniversities": [
      "pku",
      "sjtu",
      "zju",
      "fudan",
      "scu"
    ],
    "officialCode": "100501K"
  },
  {
    "id": "integrated-chinese-western-medicine",
    "name": "中西医临床医学",
    "category": "medicine",
    "description": "中西医临床医学专业结合中医和西医的理论与方法，培养既掌握现代医学知识，又具备中医诊疗技能的复合型医学人才。主要学习中医基础理论、西医基础理论、中西医诊断学、中西医内科学、中西医外科学等课程。毕业生可在医疗机构从事中西医结合诊疗工作，特别适合在基层医疗机构发挥综合优势。",
    "hotScore": 83,
    "strongUniversities": [
      "pku",
      "sjtu",
      "zju",
      "scu"
    ],
    "officialCode": "100601K"
  },
  {
    "id": "pediatrics",
    "name": "儿科学",
    "category": "medicine",
    "description": "儿科学专业专门研究儿童疾病的诊断、治疗和预防，涵盖新生儿、婴幼儿、儿童和青少年各阶段的生长发育特点和疾病规律。主要课程包括儿科学基础、小儿内科学、小儿外科学、小儿传染病学、儿童保健学等。随着国家对儿童健康的高度重视和全面二孩、三孩政策的实施，儿科医生的需求量持续增加，就业前景广阔。",
    "hotScore": 89,
    "strongUniversities": [
      "pku",
      "fudan",
      "sjtu",
      "zju",
      "cmu",
      "scu"
    ],
    "officialCode": "100207TK"
  },
  {
    "id": "anesthesiology",
    "name": "麻醉学",
    "category": "medicine",
    "description": "麻醉学专业主要研究围手术期的麻醉管理和疼痛治疗，包括临床麻醉、重症医学、疼痛诊疗等方向。核心课程包括麻醉生理学、麻醉药理学、临床麻醉学、危重病医学、疼痛诊疗学等。麻醉医生是外科手术不可或缺的重要角色，随着手术量的增加，麻醉医生的需求量大，工作强度高但收入相对较高。",
    "hotScore": 87,
    "strongUniversities": [
      "pku",
      "sjtu",
      "zju",
      "cmu",
      "afmu"
    ],
    "officialCode": "100202TK"
  },
  {
    "id": "medical-imaging",
    "name": "医学影像学",
    "category": "medicine",
    "description": "医学影像学专业主要研究利用各种医学影像技术（X线、CT、MRI、超声、核医学等）进行疾病的诊断，是现代医学诊断的重要手段。主要课程包括医学影像设备学、医学影像检查技术、影像诊断学、介入放射学等。随着医学影像技术的不断发展，该专业的应用范围越来越广，可探索多种应用方向，工作环境相对舒适。",
    "hotScore": 84,
    "strongUniversities": [
      "pku",
      "sjtu",
      "zju",
      "fudan",
      "cmu",
      "scu"
    ],
    "officialCode": "100203TK"
  },
  {
    "id": "rehabilitation-medicine",
    "name": "康复治疗学",
    "category": "medicine",
    "description": "康复治疗学专业主要研究功能障碍的评估、治疗和康复，包括物理治疗、作业治疗、言语治疗等方向。核心课程包括康复医学概论、康复评定学、物理治疗学、作业治疗学、言语治疗学、康复工程学等。随着人口老龄化和人们对生活质量要求的提高，康复医疗的需求持续增长，该专业可探索多种应用方向。",
    "hotScore": 80,
    "strongUniversities": [
      "sjtu",
      "zju",
      "cmu",
      "scu"
    ],
    "officialCode": "101005"
  },
  {
    "id": "nursing",
    "name": "护理学",
    "category": "medicine",
    "description": "护理学专业培养能够在医疗机构、社区、家庭等场所从事临床护理、护理管理、护理教育和护理科研的高级护理人才。主要学习基础医学、护理学基础、内科护理学、外科护理学、妇产科护理学、儿科护理学、护理管理学等课程。护理人员是医疗团队的重要组成部分，随着医疗事业的发展，护理专业的需求量大，就业稳定。",
    "hotScore": 86,
    "strongUniversities": [
      "pku",
      "fudan",
      "sjtu",
      "zju",
      "cmu",
      "scu"
    ],
    "officialCode": "101101K"
  },
  {
    "id": "pharmacy",
    "name": "药学",
    "category": "medicine",
    "description": "药学专业主要研究药物的发现、开发、生产、管理和临床应用，包括药物化学、药理学、药剂学、药物分析、临床药学等方向。核心课程包括有机化学、药物化学、药理学、药剂学、药物分析、药事管理学等。毕业生可在医院、制药企业、药品监管部门、科研院所等单位从事药品研发、生产、管理、临床药学等工作。",
    "hotScore": 91,
    "strongUniversities": [
      "pku",
      "sjtu",
      "zju",
      "fudan",
      "cmu",
      "scu"
    ],
    "officialCode": "100701"
  },
  {
    "id": "pharmaceutical-engineering",
    "name": "制药工程",
    "category": "engineering",
    "description": "制药工程专业是药学与工程学交叉的专业，主要研究药品的工业化生产技术和工艺，包括药物合成、药物制剂、药品质量控制、制药设备等内容。主要课程包括有机化学、药物化学、药剂学、制药工艺学、制药设备与工程设计、药品生产质量管理等。毕业生可在制药企业、医药工程设计单位从事药品生产工艺设计、生产管理、质量控制等工作。",
    "hotScore": 83,
    "strongUniversities": [
      "tsinghua",
      "sjtu",
      "zju",
      "scut",
      "tju"
    ],
    "officialCode": "081302"
  },
  {
    "id": "clinical-pharmacy",
    "name": "临床药学",
    "category": "medicine",
    "description": "临床药学专业培养能够在医疗机构从事临床药学服务、药物临床应用、用药监护和用药指导的专门人才。主要学习基础医学、临床医学、药理学、临床药理学、临床药物治疗学、药事管理学等课程。临床药师是医疗团队的重要成员，负责参与临床用药决策、监测药物疗效和不良反应、提供用药咨询等服务。",
    "hotScore": 85,
    "strongUniversities": [
      "pku",
      "sjtu",
      "zju",
      "fudan",
      "cmu"
    ],
    "officialCode": "100703TK"
  },
  {
    "id": "applied-statistics",
    "name": "应用统计学",
    "category": "science",
    "description": "应用统计学专业注重统计学方法在实际领域的应用，包括经济统计、生物统计、社会统计、金融统计等方向。核心课程包括概率论、数理统计、应用回归分析、时间序列分析、多元统计分析、统计软件应用等。毕业生可在金融、保险、市场研究、医疗、政府部门从事数据分析、统计建模、风险评估等工作，应用面广、就业前景好。",
    "hotScore": 82,
    "strongUniversities": [
      "ruc",
      "xmu",
      "ecnu",
      "swufe",
      "cufe",
      "nwnu"
    ],
    "officialCode": "071202"
  },
  {
    "id": "earth-system-science",
    "name": "地球系统科学",
    "category": "science",
    "description": "地球系统科学专业从整体角度研究地球系统各圈层（大气圈、水圈、岩石圈、生物圈）的相互作用和演化，包括全球变化、地球系统模拟、环境科学等方向。核心课程包括地球系统科学导论、大气科学、海洋科学、地球化学、生态学、全球变化等。毕业生可在气象、海洋、环境、科研院所从事地球系统研究、环境监测、全球变化分析等工作，是应对气候变化的重要专业。",
    "hotScore": 71,
    "strongUniversities": [
      "pku",
      "nju",
      "cugb",
      "cug",
      "tongji"
    ],
    "officialCode": "070604T"
  },
  {
    "id": "complex-systems",
    "name": "系统科学与工程",
    "category": "science",
    "description": "系统科学与工程研究复杂系统的结构、演化和协同规律，以建模方法理解多个要素之间的相互作用。通常学习数学、系统理论、动力学、计算机方法、建模仿真及系统分析，通过模型计算与跨学科项目训练整体分析、问题抽象和方案评价能力。所学知识可用于复杂系统研究、系统仿真、决策分析和跨学科技术应用，具体培养方案因学校而异。",
    "hotScore": 69,
    "strongUniversities": [
      "pku",
      "tsinghua",
      "ustc",
      "nju",
      "zju"
    ],
    "officialCode": "070205T"
  },
  {
    "id": "cultural-heritage",
    "name": "文物与博物馆学",
    "category": "arts",
    "description": "文物与博物馆学专业主要研究文物的保护、修复、鉴定、展示以及博物馆的运营管理，包括文物学、博物馆学、考古学、文物保护技术等方向。核心课程包括文物学概论、博物馆学概论、考古学通论、文物保护技术、文物鉴定、博物馆陈列设计等。毕业生可在博物馆、文物部门、考古机构、文化企业从事文物管理、博物馆运营、文物修复、文化传播等工作，是文化遗产保护的重要专业。",
    "hotScore": 72,
    "strongUniversities": [
      "pku",
      "fudan",
      "nju",
      "jlu",
      "bnu",
      "nku"
    ],
    "officialCode": "060104"
  },
  {
    "id": "translation",
    "name": "翻译",
    "category": "arts",
    "description": "翻译专业培养具备扎实的语言功底和翻译技能的专业人才，包括笔译、口译、同声传译等方向。核心课程包括翻译理论与实践、笔译技巧、口译技巧、同声传译、文学翻译、商务翻译、科技翻译等。毕业生可在政府部门、企业、翻译公司、媒体从事翻译、口译、本地化等工作，随着国际化程度提高，翻译人才需求量大。",
    "hotScore": 81,
    "strongUniversities": [
      "bfsu",
      "shisu",
      "xisu",
      "fudan",
      "nju",
      "sysu"
    ],
    "officialCode": "050261"
  },
  {
    "id": "archaeology",
    "name": "考古学",
    "category": "arts",
    "description": "考古学专业主要研究古代人类社会和文化的物质遗存，包括田野考古、考古理论、考古技术、文化遗产保护等方向。核心课程包括考古学导论、中国考古学、世界考古学、田野考古方法、考古学理论与方法、文物保护等。毕业生可在考古机构、博物馆、文物部门、高校从事考古发掘、文物研究、文物保护、教学等工作，是历史研究和文化遗产保护的重要专业。",
    "hotScore": 70,
    "strongUniversities": [
      "pku",
      "jlu",
      "nku",
      "nwu",
      "nju",
      "scu"
    ],
    "officialCode": "060103"
  },
  {
    "id": "cultural-industry",
    "name": "文化产业管理",
    "category": "arts",
    "description": "文化产业管理专业主要研究文化产业的发展规律、经营管理、政策法规等，包括文化创意产业、文化市场、文化传播、文化品牌等方向。核心课程包括文化产业概论、文化经济学、文化市场营销、文化创意产业、文化政策与法规、文化企业管理等。毕业生可在文化企业、文化部门、媒体、旅游企业从事文化项目管理、文化市场运营、文化品牌策划等工作，随着文化产业发展，可探索多种应用方向。",
    "hotScore": 79,
    "strongUniversities": [
      "cuc",
      "pku",
      "fudan",
      "ruc",
      "sysu",
      "whu"
    ],
    "officialCode": "120210"
  },
  {
    "id": "environmental-science",
    "name": "环境科学",
    "category": "engineering",
    "description": "环境科学主要研究污染物在环境中的迁移转化、环境质量评价及生态保护。通常学习环境化学、环境监测、环境影响评价、生态学和环境管理等内容，并通过采样分析、监测实验和环境调查，学习把化学与生态数据转化为评价依据。所学知识可用于环境监测、环保咨询、生态保护和环境研究等领域；具体课程、实践安排和培养侧重点因学校而异。",
    "hotScore": 80,
    "strongUniversities": [
      "pku",
      "fudan",
      "zju",
      "nju",
      "sysu",
      "scu"
    ],
    "officialCode": "082503"
  },
  {
    "id": "aircraft-design",
    "name": "飞行器设计与工程",
    "category": "engineering",
    "description": "飞行器设计与工程主要研究飞机及航天飞行器的总体方案、气动外形、结构与飞行性能。通常学习空气动力学、飞行动力学、结构力学、计算机辅助设计和飞行器总体设计等内容，并通过结构建模、数值仿真及设计项目，兼顾重量、强度、稳定性与制造约束。所学知识可用于航空航天设计、结构分析、试验验证和相关装备研发等领域；具体课程、实践安排和培养侧重点因学校而异。",
    "hotScore": 86,
    "strongUniversities": [
      "buaa",
      "nwpu",
      "hit",
      "nuaa"
    ],
    "officialCode": "082002"
  },
  {
    "id": "traffic-engineering",
    "name": "交通工程",
    "category": "engineering",
    "description": "交通工程主要研究道路交通系统的规划、组织、运行分析与安全改善。通常学习交通调查、交通规划、交通流理论、道路工程和交通控制等内容，并通过交通数据分析、路口设计与仿真实验，评估拥堵、出行效率和安全风险。所学知识可用于交通规划设计、智能交通、交通管理和运输咨询等领域；具体课程、实践安排和培养侧重点因学校而异。",
    "hotScore": 80,
    "strongUniversities": [
      "seu",
      "tongji",
      "bjtu",
      "swjtu"
    ],
    "officialCode": "081802"
  },
  {
    "id": "safety-engineering",
    "name": "安全工程",
    "category": "engineering",
    "description": "安全工程主要研究生产活动中的危险因素识别、事故预防和应急处置。通常学习安全系统工程、安全评价、消防工程、职业卫生和应急管理等内容，并通过风险分析、检测实验与应急方案设计，将工程技术与安全管理结合。所学知识可用于工业安全、消防技术、职业健康和安全咨询等领域；具体课程、实践安排和培养侧重点因学校而异。",
    "hotScore": 78,
    "strongUniversities": [
      "cqu",
      "cug",
      "ustb",
      "neu"
    ],
    "officialCode": "082901"
  },
  {
    "id": "surveying-mapping",
    "name": "测绘工程",
    "category": "engineering",
    "description": "测绘工程主要研究地表及工程对象的空间位置、形态测量与地理数据处理。通常学习测量学、卫星定位、摄影测量、遥感和地理信息系统等内容，并通过外业测量、误差分析与地图制作，训练空间数据获取和成果质量控制能力。所学知识可用于工程建设、自然资源调查、导航定位和空间信息服务等领域；具体课程、实践安排和培养侧重点因学校而异。",
    "hotScore": 77,
    "strongUniversities": [
      "whu",
      "cug",
      "seu",
      "tongji"
    ],
    "officialCode": "081201"
  },
  {
    "id": "logistics-engineering",
    "name": "物流工程",
    "category": "arts",
    "description": "物流工程主要研究仓储、运输、配送系统的规划与设施技术优化。通常学习运筹学、物流系统规划、仓储技术、运输组织和供应链管理等内容，并通过设施布局、仿真与优化项目，分析物流设备配置、成本和服务效率。所学知识可用于物流系统设计、仓配运营、制造业物流和供应链分析等领域；具体课程、实践安排和培养侧重点因学校而异。",
    "hotScore": 80,
    "strongUniversities": [
      "sjtu",
      "seu",
      "dlut",
      "swjtu"
    ],
    "officialCode": "120602"
  },
  {
    "id": "marketing",
    "name": "市场营销",
    "category": "arts",
    "description": "市场营销主要研究消费者需求、市场竞争、品牌定位与营销决策。通常学习市场调查、消费者行为、品牌管理、营销策划和数据分析等内容，并通过调研访谈、案例分析和营销项目，用证据评估产品、渠道与传播效果。所学知识可用于市场研究、品牌策划、产品运营和客户管理等领域；具体课程、实践安排和培养侧重点因学校而异。",
    "hotScore": 84,
    "strongUniversities": [
      "pku",
      "fudan",
      "xmu",
      "ruc",
      "sysu"
    ],
    "officialCode": "120202"
  },
  {
    "id": "broadcasting-hosting",
    "name": "播音与主持艺术",
    "category": "other",
    "description": "播音与主持艺术主要研究有声语言表达、节目主持和视听传播创作。通常学习播音发声、普通话语音、即兴口语、节目主持和视听语言等内容，并通过演播训练、采访主持和节目创作，兼顾声音表现、现场沟通与内容理解。所学知识可用于广播电视、新媒体音视频、文化活动主持和语言表达相关工作等领域；具体课程、实践安排和培养侧重点因学校而异。",
    "hotScore": 80,
    "strongUniversities": [
      "cuc",
      "bjdx",
      "shisu",
      "xmu"
    ],
    "officialCode": "130309"
  },
  {
    "id": "public-administration",
    "name": "公共事业管理",
    "category": "arts",
    "description": "公共事业管理主要研究教育、文化、卫生等公共服务领域的组织运行与资源配置。通常学习公共管理、公共政策、公共经济学、社会调查和组织管理等内容，并通过政策案例、服务评估与调查实践，关注公共服务的公平、效率和可及性。所学知识可用于事业单位、社会组织、公共服务机构和管理研究等领域；具体课程、实践安排和培养侧重点因学校而异。",
    "hotScore": 78,
    "strongUniversities": [
      "ruc",
      "pku",
      "whu",
      "xmu"
    ],
    "officialCode": "120401"
  },
  {
    "id": "social-work",
    "name": "社会工作",
    "category": "arts",
    "description": "社会工作主要研究个人、家庭和社区的社会支持需求及专业助人方法。通常学习社会学、社会政策、个案工作、小组工作、社区工作和社会调查等内容，并通过机构实习、需求评估与服务方案设计，训练访谈沟通、伦理判断和资源协调能力。所学知识可用于社区服务、公益机构、儿童及老年服务、医院社会工作等领域；具体课程、实践安排和培养侧重点因学校而异。",
    "hotScore": 75,
    "strongUniversities": [
      "ruc",
      "whu",
      "sysu",
      "ecnu"
    ],
    "officialCode": "030302"
  },
  {
    "id": "visual-communication-design",
    "name": "视觉传达设计",
    "category": "other",
    "description": "视觉传达设计主要研究通过图形、文字、色彩和媒介组织传达信息。通常学习设计基础、字体与版式、品牌设计、信息设计和交互视觉设计等内容，并通过主题调研、视觉实验与设计项目，建立从表达概念到完成作品的创作流程。所学知识可用于品牌视觉、出版设计、数字界面和文化传播设计等领域；具体课程、实践安排和培养侧重点因学校而异。",
    "hotScore": 83,
    "strongUniversities": [
      "cafa",
      "lzu",
      "tongji",
      "scut"
    ],
    "officialCode": "130502"
  },
  {
    "id": "music-performance",
    "name": "音乐表演",
    "category": "other",
    "description": "音乐表演主要研究声乐或器乐的演绎、音乐作品理解和舞台表现。通常学习专业演唱或演奏、乐理、视唱练耳、和声和音乐史等内容，并通过个人训练、合奏排练与舞台实践，发展技术控制、作品分析和艺术表达能力。所学知识可用于演出团体、音乐教育、文化活动和音乐相关创作等领域；具体课程、实践安排和培养侧重点因学校而异。",
    "hotScore": 79,
    "strongUniversities": [
      "ccom",
      "shcm",
      "xcm",
      "sica"
    ],
    "officialCode": "130201"
  },
  {
    "id": "medical-laboratory",
    "name": "医学检验技术",
    "category": "medicine",
    "description": "医学检验技术专业主要培养从事临床检验、实验室诊断、检验仪器操作与维护的技术人才。主要学习基础医学、临床医学、医学检验技术、临床生物化学检验、临床微生物学检验、临床血液学检验、临床免疫学检验等课程。医学检验技术人员是医疗团队的重要成员，负责各类检验项目的操作和质量控制，随着精准医疗的发展，该专业的重要性日益凸显。",
    "hotScore": 82,
    "strongUniversities": [
      "pku",
      "sjtu",
      "zju",
      "fudan",
      "cmu",
      "scu"
    ],
    "officialCode": "101001"
  },
  {
    "id": "ophthalmology",
    "name": "眼视光医学",
    "category": "medicine",
    "description": "眼视光医学专业主要研究眼部疾病的诊断、治疗和视觉功能的保护与改善，包括眼科临床、视光学、视觉康复等方向。主要课程包括眼科学基础、临床眼科学、视光学基础、眼视光器械学、视觉功能评估、视觉康复等。随着电子设备普及和人口老龄化，眼部疾病和视觉问题增多，眼视光医学专业的需求持续增长，可探索多种应用方向。",
    "hotScore": 83,
    "strongUniversities": [
      "sjtu",
      "zju",
      "fudan",
      "cmu",
      "scu"
    ],
    "officialCode": "100204TK"
  },
  {
    "id": "radiotherapy",
    "name": "放射医学",
    "category": "medicine",
    "description": "放射医学专业主要研究放射诊断和放射治疗在医学中的应用，包括医学影像诊断、放射治疗、核医学等方向。主要课程包括医学影像设备学、影像诊断学、放射治疗学、核医学、放射防护等。放射医学是肿瘤治疗的重要手段，随着肿瘤发病率的提高，放射医学专业人才需求量大，毕业生可在医院、肿瘤中心从事放射诊断和治疗工作。",
    "hotScore": 80,
    "strongUniversities": [
      "pku",
      "sjtu",
      "zju",
      "fudan",
      "cmu"
    ],
    "officialCode": "100206TK"
  },
  {
    "id": "mental-health",
    "name": "精神医学",
    "category": "medicine",
    "description": "精神医学专业主要研究精神疾病的诊断、治疗和预防，以及心理健康的维护，包括临床精神病学、儿童精神病学、老年精神病学等方向。主要课程包括精神病学基础、临床精神病学、心理治疗、精神药理学、精神疾病康复等。随着社会压力增大和人们对心理健康的重视，精神医学专业的需求持续增长，毕业生可在精神卫生中心、综合医院精神科从事精神疾病的诊疗工作。",
    "hotScore": 86,
    "strongUniversities": [
      "pku",
      "sjtu",
      "zju",
      "fudan",
      "scu"
    ],
    "officialCode": "100205TK"
  },
  {
    "id": "robotics-eng",
    "name": "机器人工程",
    "category": "engineering",
    "description": "机器人工程主要研究机器人的机械本体、感知、运动控制及系统集成。通常学习机械设计、电路、控制理论、传感器、机器人学和程序设计等内容，并通过机器人建模、控制实验和系统搭建，在机械、电子与算法之间完成协同设计。所学知识可用于工业机器人、自动化产线、服务机器人和智能装备研发等领域；具体课程、实践安排和培养侧重点因学校而异。",
    "hotScore": 92,
    "strongUniversities": [
      "hit",
      "sjtu",
      "zju",
      "neu",
      "hust"
    ],
    "officialCode": "080803T"
  },
  {
    "id": "intelligent-sci",
    "name": "智能科学与技术",
    "category": "engineering",
    "description": "智能科学与技术主要研究智能信息处理、机器感知、推理决策和智能系统实现。通常学习数学基础、程序设计、机器学习、模式识别、知识表示和智能控制等内容，并通过算法实验、数据分析与系统项目，学习把智能方法落实到可运行的软硬件系统。所学知识可用于人工智能研发、智能交互、自动化应用和数据分析等领域；具体课程、实践安排和培养侧重点因学校而异。",
    "hotScore": 90,
    "strongUniversities": [
      "pku",
      "tsinghua",
      "cas",
      "fudan"
    ],
    "officialCode": "080907T"
  },
  {
    "id": "ic-design",
    "name": "集成电路设计与集成系统",
    "category": "engineering",
    "description": "集成电路设计与集成系统主要研究数字与模拟芯片设计、验证及片上系统集成。通常学习半导体器件、模拟电路、数字电路、硬件描述语言和集成电路设计等内容，并通过电路仿真、逻辑验证和设计工具实践，理解性能、功耗、面积与可靠性的取舍。所学知识可用于芯片设计、验证测试、电子设计自动化和系统应用等领域；具体课程、实践安排和培养侧重点因学校而异。",
    "hotScore": 95,
    "strongUniversities": [
      "tsinghua",
      "pku",
      "fudan",
      "uestc",
      "xidian"
    ],
    "officialCode": "080710T"
  },
  {
    "id": "microelectronics",
    "name": "微电子科学与工程",
    "category": "engineering",
    "description": "微电子科学与工程主要研究半导体材料、微电子器件及集成电路的工作原理与制造。通常学习固体物理、半导体物理、电子器件、集成电路和微电子工艺等内容，并通过器件测试、电路实验及工艺学习，联系材料性质、器件结构与电子性能。所学知识可用于半导体器件、芯片制造、工艺开发和测试分析等领域；具体课程、实践安排和培养侧重点因学校而异。",
    "hotScore": 93,
    "strongUniversities": [
      "tsinghua",
      "pku",
      "fudan",
      "zju",
      "uestc"
    ],
    "officialCode": "080704"
  },
  {
    "id": "instrument-tech",
    "name": "测控技术与仪器",
    "category": "engineering",
    "description": "测控技术与仪器主要研究物理量测量、信号处理及仪器系统的设计和控制。通常学习传感器、测量电路、误差理论、信号处理和自动控制等内容，并通过仪器设计、标定与数据采集实验，训练精度分析、软硬件联调和检测能力。所学知识可用于智能仪器、工业检测、自动化测控和计量技术等领域；具体课程、实践安排和培养侧重点因学校而异。",
    "hotScore": 84,
    "strongUniversities": [
      "tsinghua",
      "hit",
      "buaa",
      "tju"
    ],
    "officialCode": "080301"
  },
  {
    "id": "energy-env-eng",
    "name": "能源与环境系统工程",
    "category": "engineering",
    "description": "能源与环境系统工程主要研究能源转换利用与污染控制之间的系统协调。通常学习热力学、传热学、流体力学、能源系统分析和污染控制等内容，并通过能效计算、设备实验和系统优化项目，比较不同能源方案的效率与环境影响。所学知识可用于能源系统设计、节能改造、清洁能源应用和环境技术等领域；具体课程、实践安排和培养侧重点因学校而异。",
    "hotScore": 82,
    "strongUniversities": [
      "tsinghua",
      "zju",
      "sjtu",
      "xjtu"
    ],
    "officialCode": "080502T"
  },
  {
    "id": "composite-materials",
    "name": "复合材料与工程",
    "category": "engineering",
    "description": "复合材料与工程主要研究不同组分材料的组合设计、成型加工和性能评价。通常学习材料科学、复合材料原理、成型工艺、材料力学和结构设计等内容，并通过材料制备、力学测试与结构分析，理解基体、增强体和界面对性能的影响。所学知识可用于航空航天、汽车、风电设备和高性能材料研发等领域；具体课程、实践安排和培养侧重点因学校而异。",
    "hotScore": 86,
    "strongUniversities": [
      "hit",
      "bit",
      "whut",
      "nwpu"
    ],
    "officialCode": "080408"
  },
  {
    "id": "industrial-design",
    "name": "工业设计",
    "category": "engineering",
    "description": "工业设计主要研究工业产品的使用体验、形态、结构及技术实现。通常学习设计基础、人机工程、产品设计、材料工艺和计算机辅助设计等内容，并通过用户研究、草图表达、模型制作与原型测试，平衡功能、审美、制造和使用需求。所学知识可用于产品设计、交互设计、设计咨询和企业产品研发等领域；具体课程、实践安排和培养侧重点因学校而异。",
    "hotScore": 88,
    "strongUniversities": [
      "tsinghua",
      "hnu",
      "jiangnan",
      "tongji"
    ],
    "officialCode": "080205"
  },
  {
    "id": "process-equipment",
    "name": "过程装备与控制工程",
    "category": "engineering",
    "description": "过程装备与控制工程主要研究化工、能源及制药过程中的设备、管路与控制系统。通常学习工程力学、机械设计、过程原理、过程设备和自动控制等内容，并通过设备设计、强度校核、工艺分析与控制实验，兼顾安全、能效和稳定运行。所学知识可用于过程设备设计、化工装备、工程建设和生产技术管理等领域；具体课程、实践安排和培养侧重点因学校而异。",
    "hotScore": 81,
    "strongUniversities": [
      "ecust",
      "tju",
      "zju",
      "cup"
    ],
    "officialCode": "080206"
  },
  {
    "id": "port-coastal-eng",
    "name": "港口航道与海岸工程",
    "category": "engineering",
    "description": "港口航道与海岸工程主要研究港口设施、航道整治及海岸工程的规划和建设。通常学习水力学、海岸动力学、土力学、港口规划和水工建筑物等内容，并通过水工实验、工程计算与设计实践，分析波浪、水流、地基及施工条件。所学知识可用于港口航道设计、水运建设、海岸保护和工程管理等领域；具体课程、实践安排和培养侧重点因学校而异。",
    "hotScore": 83,
    "strongUniversities": [
      "hhu",
      "tju",
      "dlut",
      "whu"
    ],
    "officialCode": "081103"
  },
  {
    "id": "aircraft-power",
    "name": "飞行器动力工程",
    "category": "engineering",
    "description": "飞行器动力工程主要研究航空及航天推进系统的原理、设计与运行。通常学习热力学、流体力学、传热学、燃烧学和航空发动机原理等内容，并通过性能计算、结构分析及推进系统实验，研究动力装置的效率、可靠性与工作边界。所学知识可用于航空发动机、航天动力、动力试验和相关装备研发等领域；具体课程、实践安排和培养侧重点因学校而异。",
    "hotScore": 87,
    "strongUniversities": [
      "buaa",
      "nwpu",
      "nuaa",
      "tsinghua"
    ],
    "officialCode": "082004"
  },
  {
    "id": "aircraft-manufacturing",
    "name": "飞行器制造工程",
    "category": "engineering",
    "description": "飞行器制造工程主要研究航空航天结构的加工、装配及制造过程组织。通常学习工程材料、机械制造、飞行器结构、数字化制造和装配工艺等内容，并通过工艺规划、数控加工与装配实践，理解复杂结构的精度、质量和制造约束。所学知识可用于航空制造、工艺设计、质量检测和数字化制造等领域；具体课程、实践安排和培养侧重点因学校而异。",
    "hotScore": 85,
    "strongUniversities": [
      "nwpu",
      "buaa",
      "nuaa",
      "sjtu"
    ],
    "officialCode": "082003"
  },
  {
    "id": "explosive-tech",
    "name": "弹药工程与爆炸技术",
    "category": "engineering",
    "description": "弹药工程与爆炸技术主要研究弹药系统、爆炸作用及相关工程安全与试验技术。通常学习工程力学、材料与化学基础、弹药工程、爆炸理论和测试技术等内容，并通过工程设计、仿真与规范化试验学习，重视安全管理、可靠性和效应评价。所学知识可用于国防装备研发、试验评估和相关工程技术等领域；具体课程、实践安排和培养侧重点因学校而异。",
    "hotScore": 80,
    "strongUniversities": [
      "bit",
      "njust"
    ],
    "officialCode": "082104"
  },
  {
    "id": "radiation-protection",
    "name": "辐射防护与核安全",
    "category": "engineering",
    "description": "辐射防护与核安全主要研究电离辐射监测、防护措施及核设施安全评价。通常学习原子核物理、辐射探测、剂量学、辐射防护和核安全分析等内容，并通过探测实验、屏蔽计算与风险分析，学习评价辐射影响和建立防护方案。所学知识可用于核设施安全、辐射监测、医疗辐射防护和环境监管技术等领域；具体课程、实践安排和培养侧重点因学校而异。",
    "hotScore": 82,
    "strongUniversities": [
      "tsinghua",
      "pku",
      "heu",
      "lzu"
    ],
    "officialCode": "082202"
  },
  {
    "id": "prosthetics-eng",
    "name": "假肢矫形工程",
    "category": "engineering",
    "description": "假肢矫形工程主要研究假肢、矫形器的工程设计及其功能适配。通常学习解剖学、生物力学、工程材料、机械设计和假肢矫形技术等内容，并通过器具制作、步态分析与适配训练，将人体功能需求转化为结构和材料方案。所学知识可用于康复器具设计、假肢矫形配置、辅助技术和康复工程等领域；具体课程、实践安排和培养侧重点因学校而异。",
    "hotScore": 78,
    "strongUniversities": [
      "ccmu",
      "scu"
    ],
    "officialCode": "082602T"
  },
  {
    "id": "agri-mechanization",
    "name": "农业机械化及其自动化",
    "category": "engineering",
    "description": "农业机械化及其自动化主要研究农业生产机械、装备运行及自动化技术。通常学习机械设计、农业机械学、液压技术、自动控制和农业生产基础等内容，并通过机械试验、作业性能分析与控制实践，关注农艺要求、作业质量与装备效率。所学知识可用于农业装备研发、机械化生产、智慧农业和技术服务等领域；具体课程、实践安排和培养侧重点因学校而异。",
    "hotScore": 79,
    "strongUniversities": [
      "cau",
      "njau",
      "zju"
    ],
    "officialCode": "082302"
  },
  {
    "id": "forestry-eng-new",
    "name": "森林工程",
    "category": "engineering",
    "description": "森林工程主要研究森林经营作业、林区道路及林业生产装备的工程组织。通常学习工程力学、林业机械、森林作业、林区道路和工程管理等内容，并通过作业规划、设备分析与野外实践，兼顾生产效率、人员安全和生态保护。所学知识可用于林业工程、生态建设、生产组织和相关机械技术等领域；具体课程、实践安排和培养侧重点因学校而异。",
    "hotScore": 77,
    "strongUniversities": [
      "nefu",
      "bjfu",
      "njfu"
    ],
    "officialCode": "082401"
  },
  {
    "id": "wood-science",
    "name": "木材科学与工程",
    "category": "engineering",
    "description": "木材科学与工程主要研究木材及木质复合材料的性质、加工与产品制造。通常学习木材学、木材干燥、木材加工、人造板工艺和家具设计等内容，并通过材料检测、加工试验与产品设计，关注木材利用效率、产品性能和绿色制造。所学知识可用于木材加工、家具制造、木质材料研发和质量控制等领域；具体课程、实践安排和培养侧重点因学校而异。",
    "hotScore": 76,
    "strongUniversities": [
      "bjfu",
      "njfu",
      "nefu"
    ],
    "officialCode": "082402"
  },
  {
    "id": "vet-medicine",
    "name": "动物医学",
    "category": "other",
    "description": "动物医学主要研究动物疾病的诊断防治、动物健康及兽医公共卫生。通常学习动物解剖、生理、生化、病理、兽医药理和临床诊疗等内容，并通过实验诊断、动物临床与防疫实践，训练病因分析、疾病预防和规范诊疗能力。所学知识可用于动物医院、养殖兽医、防疫检疫和兽医研究等领域；具体课程、实践安排和培养侧重点因学校而异。",
    "hotScore": 89,
    "strongUniversities": [
      "cau",
      "hzau",
      "njau"
    ],
    "officialCode": "090401"
  },
  {
    "id": "quarantine-tech",
    "name": "动植物检疫",
    "category": "other",
    "description": "动植物检疫主要研究动物和植物疫病、害虫及相关生物安全风险的识别与控制。通常学习微生物学、动物疫病、植物病理、昆虫学和检疫检验等内容，并通过病原鉴定、检疫实验与风险评估，联系生产、流通和进出境环节的生物安全要求。所学知识可用于检疫检测、农产品安全、防疫机构和生物安全技术等领域；具体课程、实践安排和培养侧重点因学校而异。",
    "hotScore": 81,
    "strongUniversities": [
      "cau",
      "njau"
    ],
    "officialCode": "090403T"
  },
  {
    "id": "aquaculture",
    "name": "水产养殖学",
    "category": "other",
    "description": "水产养殖学主要研究水生生物的繁育养殖、营养健康及水环境管理。通常学习水生生物学、鱼类学、养殖技术、水产营养和水环境化学等内容，并通过繁育实验、养殖生产与水质监测，分析生物生长、饲料和环境之间的关系。所学知识可用于水产育种养殖、饲料研发、水产健康和技术推广等领域；具体课程、实践安排和培养侧重点因学校而异。",
    "hotScore": 82,
    "strongUniversities": [
      "ouc",
      "scau"
    ],
    "officialCode": "090601"
  },
  {
    "id": "landscape-arch",
    "name": "园林",
    "category": "other",
    "description": "园林主要研究园林植物应用、绿地规划设计与景观养护。通常学习植物学、园林树木、花卉学、园林设计和园林工程等内容，并通过植物调查、景观绘图与设计实践，兼顾生态功能、空间体验和后期养护。所学知识可用于园林设计、城市绿化、植物生产和景观养护等领域；具体课程、实践安排和培养侧重点因学校而异。",
    "hotScore": 85,
    "strongUniversities": [
      "bjfu",
      "njfu",
      "tsinghua"
    ],
    "officialCode": "090502"
  },
  {
    "id": "tea-science",
    "name": "茶学",
    "category": "other",
    "description": "茶学主要研究茶树栽培育种、茶叶加工、品质分析及茶产业。通常学习植物生理、茶树栽培、茶叶加工、茶叶审评和茶叶生物化学等内容，并通过种植调查、加工实验与感官评审，理解鲜叶原料、加工条件和品质形成机制。所学知识可用于茶叶生产、品质检测、产品开发和茶业技术服务等领域；具体课程、实践安排和培养侧重点因学校而异。",
    "hotScore": 78,
    "strongUniversities": [
      "ahau",
      "zju",
      "hnum"
    ],
    "officialCode": "090107T"
  },
  {
    "id": "brewing-eng",
    "name": "酿酒工程",
    "category": "engineering",
    "description": "酿酒工程主要研究酒类发酵、生产工艺控制与品质评价。通常学习微生物学、生物化学、发酵工程、酿酒工艺和食品分析等内容，并通过发酵实验、工艺设计与品质检测，关注原料、菌种、生产条件及食品安全。所学知识可用于酒类生产、发酵技术、质量控制和产品研发等领域；具体课程、实践安排和培养侧重点因学校而异。",
    "hotScore": 84,
    "strongUniversities": [
      "jiangnan",
      "scut"
    ],
    "officialCode": "082705"
  },
  {
    "id": "non-woven",
    "name": "非织造材料与工程",
    "category": "engineering",
    "description": "非织造材料与工程主要研究纤维通过成网与固结形成非织造材料的工艺和性能。通常学习纤维材料、非织造工艺、材料测试、后整理和产品设计等内容，并通过成网加工、性能检测与应用设计，比较不同结构对过滤、吸收和强度的影响。所学知识可用于医疗卫生材料、过滤材料、土工材料和功能纺织品等领域；具体课程、实践安排和培养侧重点因学校而异。",
    "hotScore": 80,
    "strongUniversities": [
      "dhu",
      "tjpu"
    ],
    "officialCode": "081603T"
  },
  {
    "id": "digital-media",
    "name": "数字媒体技术",
    "category": "engineering",
    "description": "数字媒体技术主要研究数字影像、交互内容及虚拟环境的计算机实现。通常学习程序设计、计算机图形学、图像处理、游戏开发和交互技术等内容，并通过图形编程、互动作品与团队项目，结合技术实现、内容表达和用户体验。所学知识可用于游戏技术、虚拟现实、数字内容开发和交互系统等领域；具体课程、实践安排和培养侧重点因学校而异。",
    "hotScore": 88,
    "strongUniversities": [
      "zju",
      "whu",
      "bit"
    ],
    "officialCode": "080906"
  },
  {
    "id": "blockchain-eng",
    "name": "区块链工程",
    "category": "engineering",
    "description": "区块链工程主要研究分布式账本、密码机制及可信应用系统设计。通常学习程序设计、数据结构、密码学、分布式系统和智能合约等内容，并通过系统开发、合约测试与安全分析，理解一致性、权限、性能和可信协作的约束。所学知识可用于可信数据平台、金融科技、供应链系统和软件研发等领域；具体课程、实践安排和培养侧重点因学校而异。",
    "hotScore": 91,
    "strongUniversities": [
      "tsinghua",
      "zju",
      "bupt"
    ],
    "officialCode": "080917T"
  },
  {
    "id": "fintech-major",
    "name": "金融科技",
    "category": "arts",
    "description": "金融科技主要研究金融业务与数据计算、数字平台及智能技术的结合。通常学习金融学、经济学、统计学、程序设计和金融风险管理等内容，并通过金融数据分析、模型实验和应用项目，评估数字支付、风险控制等场景的合规与效果。所学知识可用于金融数据分析、风险管理、金融产品和数字金融技术等领域；具体课程、实践安排和培养侧重点因学校而异。",
    "hotScore": 90,
    "strongUniversities": [
      "pku",
      "ruc",
      "sufe"
    ],
    "officialCode": "020310T"
  },
  {
    "id": "finance-engineering",
    "name": "金融工程",
    "category": "arts",
    "officialCode": "020302",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "金融工程主要研究金融产品的定价、风险分析和量化管理。通常学习经济学、金融学、概率统计、计量经济学和金融工程等内容，并通过金融数据处理、模型计算与案例分析，训练对模型假设和风险边界的判断。所学知识可用于金融机构风险管理、量化分析和金融产品研究等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "fiscal-studies",
    "name": "财政学",
    "category": "arts",
    "officialCode": "020201K",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "财政学主要研究政府收支、公共资源配置和财政政策。通常学习微宏观经济学、公共经济学、财政学、税收和预算管理等内容，并通过政策分析、财政数据处理与案例研究，理解公共支出、税收和社会经济之间的联系。所学知识可用于财政研究、公共政策分析和财税相关管理等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "taxation",
    "name": "税收学",
    "category": "arts",
    "officialCode": "020202",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "税收学主要研究税收制度、税务核算及税收政策的经济影响。通常学习经济学、税法、会计学、税务管理和国际税收等内容，并通过税务计算、政策案例与实务训练，学习依法分析税务事项和评估政策效果。所学知识可用于税务服务、企业税务管理和财税政策研究等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "insurance",
    "name": "保险学",
    "category": "arts",
    "officialCode": "020303",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "保险学主要研究风险分担、保险产品及保险机构经营管理。通常学习经济学、金融学、保险学、概率统计和风险管理等内容，并通过产品案例、风险评估与精算基础训练，理解保障责任、定价逻辑和业务规范。所学知识可用于保险产品、核保理赔、风险管理和保险服务等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "financial-management",
    "name": "财务管理",
    "category": "arts",
    "officialCode": "120204",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "财务管理主要研究企业筹资、投资、资金运营和财务决策。通常学习会计学、财务管理、经济学、管理学和财务分析等内容，并通过报表分析、投资测算与案例实践，评价企业资金需求、经营绩效与财务风险。所学知识可用于企业财务、投融资分析、预算管理和财务咨询等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "auditing",
    "name": "审计学",
    "category": "arts",
    "officialCode": "120207",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "审计学主要研究经济活动、财务信息和内部控制的独立检查评价。通常学习会计学、审计学、内部控制、经济法和数据分析等内容，并通过审计案例、证据分析与实务模拟，训练风险识别、程序设计和职业判断。所学知识可用于审计服务、内部审计、合规管理和财务监督等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "human-resource",
    "name": "人力资源管理",
    "category": "arts",
    "officialCode": "120206",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "人力资源管理主要研究组织中的人才招聘、发展、绩效及劳动关系。通常学习管理学、组织行为学、劳动经济学、招聘培训和薪酬管理等内容，并通过岗位分析、调查与管理案例，理解人员发展、组织目标和劳动规范的关系。所学知识可用于人力资源运营、人才发展、组织管理和咨询等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "administrative-management",
    "name": "行政管理",
    "category": "arts",
    "officialCode": "120402",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "行政管理主要研究政府及公共组织的运行、公共政策和社会治理。通常学习政治学、行政学、公共政策、行政法和社会调查等内容，并通过政策研读、公共事务案例与调查实践，分析治理流程、公共责任和服务效果。所学知识可用于公共事务、行政管理、社会组织和政策研究等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "e-commerce",
    "name": "电子商务",
    "category": "arts",
    "officialCode": "120801",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "电子商务主要研究线上交易、数字商业模式和商务平台运营。通常学习管理学、经济学、电子商务、网络营销、数据分析和信息技术等内容，并通过平台运营、业务分析与项目实践，联系交易流程、用户需求和供应链协作。所学知识可用于电商运营、数字营销、商务分析和平台产品等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "logistics-management",
    "name": "物流管理",
    "category": "arts",
    "officialCode": "120601",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "物流管理主要研究货物流通、仓储配送及供应链的组织与管理。通常学习管理学、经济学、运筹学、物流管理和供应链管理等内容，并通过运营案例、库存分析与流程设计，优化成本、服务水平和供需协调。所学知识可用于物流运营、采购管理、供应链分析和企业配送管理等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "information-management",
    "name": "信息管理与信息系统",
    "category": "arts",
    "officialCode": "120102",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "信息管理与信息系统主要研究组织信息资源管理、业务流程及信息系统建设。通常学习管理学、经济学、程序设计、数据库、系统分析和数据管理等内容，并通过业务调研、系统建模与数据分析，连接管理需求和数字化技术方案。所学知识可用于企业信息化、系统分析、数据管理和数字化咨询等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "preschool",
    "name": "学前教育",
    "category": "arts",
    "officialCode": "040106",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "学前教育主要研究学龄前儿童的发展、保育和教育活动设计。通常学习教育学、儿童心理、学前课程、幼儿游戏和健康教育等内容，并通过幼儿观察、活动设计与保教实践，学习尊重发展差异并与家庭协作。所学知识可用于幼儿保教、儿童教育产品、教育研究和相关服务等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "primary-education",
    "name": "小学教育",
    "category": "arts",
    "officialCode": "040107",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "小学教育主要研究小学阶段的儿童发展、学科教学和学校教育。通常学习教育学、发展心理学、小学课程、学科教学法和班级管理等内容，并通过教学设计、课堂观察与教育实习，训练课程组织、评价反馈和师生沟通。所学知识可用于小学教育、课程开发、教学研究和教育服务等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "special-education",
    "name": "特殊教育",
    "category": "arts",
    "officialCode": "040108",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "特殊教育主要研究特殊教育需要学生的学习支持、发展与融合教育。通常学习教育学、心理学、特殊儿童发展、教育评估和教学方法等内容，并通过儿童观察、个别化教育计划与教育实践，关注学习差异、参与机会和支持环境。所学知识可用于特殊教育、融合教育支持、教育评估和相关机构服务等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "network-new-media",
    "name": "网络与新媒体",
    "category": "arts",
    "officialCode": "050306T",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "网络与新媒体主要研究数字媒体的信息传播、内容生产及平台运作。通常学习新闻传播、视听语言、新媒体编辑、交互内容和媒介伦理等内容，并通过内容创作、用户分析和传播项目，兼顾表达效果、事实核实与平台规律。所学知识可用于新媒体内容、媒体策划、数字传播和平台运营等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "communication-studies",
    "name": "传播学",
    "category": "arts",
    "officialCode": "050304",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "传播学主要研究信息传播过程、媒介作用及人与社会的沟通。通常学习传播理论、媒介研究、社会调查、传播心理和数据分析等内容，并通过调查设计、内容分析与传播案例，研究受众行为、信息效果和媒介环境。所学知识可用于传播研究、媒体策划、公共传播和市场研究等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "german",
    "name": "德语",
    "category": "arts",
    "officialCode": "050203",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "德语主要研究德语语言运用、德语国家文学文化及跨文化交流。通常学习综合德语、听说读写、翻译、语言学和德国文学文化等内容，并通过文本阅读、口笔译与交流实践，训练准确表达和不同文化背景下的沟通能力。所学知识可用于翻译、国际交流、出版文化和涉外业务等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "french",
    "name": "法语",
    "category": "arts",
    "officialCode": "050204",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "法语主要研究法语语言运用、法语文学文化和跨文化沟通。通常学习综合法语、听说读写、翻译、语言学和法语国家文化等内容，并通过原文阅读、口笔译及交流训练，建立语言表达、文本理解和文化分析能力。所学知识可用于翻译、国际交流、文化传播和涉外业务等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "russian",
    "name": "俄语",
    "category": "arts",
    "officialCode": "050202",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "俄语主要研究俄语语言、文学文化和跨文化交流。通常学习综合俄语、听说读写、翻译、语言学和俄罗斯文化等内容，并通过文本阅读、翻译与沟通训练，提升对语言细节、社会文化和语境的理解。所学知识可用于翻译、国际交流、文化出版和涉外业务等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "mechanical-design",
    "name": "机械设计制造及其自动化",
    "category": "engineering",
    "officialCode": "080202",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "机械设计制造及其自动化主要研究机械产品的设计、加工制造及自动化生产。通常学习机械制图、工程力学、机械设计、制造技术和控制基础等内容，并通过结构设计、加工实训与系统项目，把产品要求转化为可制造的机械方案。所学知识可用于机械研发、工艺设计、制造自动化和装备维护等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "mechatronics",
    "name": "机械电子工程",
    "category": "engineering",
    "officialCode": "080204",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "机械电子工程主要研究机械结构、电子技术和控制系统的协同设计。通常学习机械设计、电路、电子技术、控制理论和嵌入式系统等内容，并通过机电装置设计、程序开发与联调实验，解决结构、驱动和控制之间的配合问题。所学知识可用于智能装备、机电系统、工业控制和设备研发等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "intelligent-manufacturing",
    "name": "智能制造工程",
    "category": "engineering",
    "officialCode": "080213T",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "智能制造工程主要研究制造过程的数字化、自动化与智能协同。通常学习机械制造、控制技术、工业网络、数据分析和制造系统等内容，并通过产线建模、装备联调与数字化项目，分析生产效率、质量和系统集成。所学知识可用于智能工厂、制造系统集成、工业软件和生产技术等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "cybersecurity",
    "name": "网络空间安全",
    "category": "engineering",
    "officialCode": "080911TK",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "网络空间安全主要研究网络、系统及数据的安全防护与可信运行。通常学习计算机系统、网络、密码学、软件安全和安全管理等内容，并通过安全分析、攻防实验与防护设计，理解漏洞成因、风险评估和合规边界。所学知识可用于网络安全、系统防护、安全测评和数据保护等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "electronic-science",
    "name": "电子科学与技术",
    "category": "engineering",
    "officialCode": "080702",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "电子科学与技术主要研究电子器件、电路及电子系统的基础原理和实现。通常学习电路、模拟与数字电子、半导体物理、信号系统和电磁场等内容，并通过器件测试、电路设计与系统实验，联系材料、器件和系统层面的性能要求。所学知识可用于电子器件、集成电路、电子系统和相关测试研发等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "new-energy",
    "name": "新能源科学与工程",
    "category": "engineering",
    "officialCode": "080503T",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "新能源科学与工程主要研究太阳能、风能等新能源的转换、利用和系统设计。通常学习热力学、电工电子、能源转换、新能源技术和系统分析等内容，并通过能源设备实验、性能计算与方案设计，分析资源条件、转换效率和运行特性。所学知识可用于新能源设备、能源系统、项目技术和清洁能源研发等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "energy-storage",
    "name": "储能科学与工程",
    "category": "engineering",
    "officialCode": "080504T",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "储能科学与工程主要研究能量存储、转换及储能系统的安全可靠运行。通常学习电化学、材料科学、热力学、电工电子和储能技术等内容，并通过电池测试、储能材料实验与系统分析，比较寿命、效率、安全和使用场景。所学知识可用于储能材料、电池技术、储能系统和能源应用等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "polymer-materials",
    "name": "高分子材料与工程",
    "category": "engineering",
    "officialCode": "080407",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "高分子材料与工程主要研究高分子材料的合成、结构性能和成型加工。通常学习高分子化学、高分子物理、聚合物加工和材料测试等内容，并通过聚合实验、加工与性能评价，理解分子结构、工艺条件和产品性能的联系。所学知识可用于塑料、橡胶、纤维、功能材料和相关产品研发等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "bioengineering",
    "name": "生物工程",
    "category": "engineering",
    "officialCode": "083001",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "生物工程主要研究利用生物体系和工程方法开展生产、加工与技术开发。通常学习生物化学、微生物学、发酵工程、生物分离和生物反应工程等内容，并通过菌种培养、发酵实验与工艺设计，关注过程放大、产品分离及质量控制。所学知识可用于生物制造、发酵工业、医药食品技术和生物工艺研发等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "biopharmaceutical",
    "name": "生物制药",
    "category": "engineering",
    "officialCode": "083002T",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "生物制药主要研究生物药物的研发、生产工艺及质量评价。通常学习生物化学、分子生物学、药理学、生物制药工艺和质量控制等内容，并通过细胞培养、分离分析与工艺实践，理解生物产品的活性、稳定性和生产要求。所学知识可用于生物药研发、生产工艺、质量分析和技术服务等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "food-quality",
    "name": "食品质量与安全",
    "category": "engineering",
    "officialCode": "082702",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "食品质量与安全主要研究食品生产流通中的质量控制、安全检测与风险管理。通常学习食品化学、微生物学、食品分析、食品毒理和质量管理等内容，并通过检测实验、质量体系案例和风险分析，识别污染因素并评价食品安全控制措施。所学知识可用于食品检测、质量管理、风险评估和食品安全技术等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "urban-planning",
    "name": "城乡规划",
    "category": "engineering",
    "officialCode": "082802",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "城乡规划主要研究城乡空间布局、土地利用和人居环境的规划。通常学习规划原理、城市设计、地理信息、交通规划和建筑基础等内容，并通过现场调查、空间分析与规划设计，协调公共需求、历史文化、生态和发展条件。所学知识可用于城乡规划、城市设计、空间研究和规划管理等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "landscape-architecture",
    "name": "风景园林",
    "category": "engineering",
    "officialCode": "082803",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "风景园林主要研究开放空间、景观环境的规划设计和生态修复。通常学习景观设计、植物应用、园林工程、生态规划和场地设计等内容，并通过场地调查、绘图建模与设计实践，平衡空间体验、生态过程和工程可实施性。所学知识可用于景观设计、生态修复、公共空间和园林工程等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "remote-sensing",
    "name": "遥感科学与技术",
    "category": "engineering",
    "officialCode": "081202",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "遥感科学与技术主要研究利用遥感影像获取、解释和分析地表信息。通常学习遥感原理、摄影测量、图像处理、地理信息系统和空间数据分析等内容，并通过影像解译、算法实验与调查项目，评价观测数据的精度及应用可靠性。所学知识可用于自然资源调查、环境监测、测绘和空间信息技术等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "applied-mechanics",
    "name": "工程力学",
    "category": "engineering",
    "officialCode": "080102",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "工程力学主要研究工程结构、材料和系统在载荷作用下的响应。通常学习理论力学、材料力学、结构力学、流体力学和计算力学等内容，并通过力学实验、数值计算与工程建模，分析强度、刚度、稳定性和动力特征。所学知识可用于结构分析、工程仿真、装备设计和试验研究等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "chemical-biology",
    "name": "化学生物学",
    "category": "science",
    "officialCode": "070303T",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "化学生物学主要研究用化学方法理解、探测和调控生命过程。通常学习化学、生物化学、分子生物学、化学分析和化学生物学等内容，并通过分子合成、分析检测与生物实验，联系分子结构、相互作用和生物功能。所学知识可用于生命科学研究、药物相关研究和生物分析技术等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "geochemistry",
    "name": "地球化学",
    "category": "science",
    "officialCode": "070902",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "地球化学主要研究地球物质的化学组成、元素迁移及地质过程。通常学习地质学、化学、矿物学、岩石学和地球化学等内容，并通过野外采样、元素分析与数据解释，用化学证据认识成岩、成矿和环境演变。所学知识可用于地质调查、资源研究、环境地球化学和分析技术等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "natural-geography",
    "name": "自然地理与资源环境",
    "category": "science",
    "officialCode": "070502",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "自然地理与资源环境主要研究自然地理过程、资源利用及环境变化。通常学习自然地理学、生态学、地理信息系统、资源环境评价和遥感等内容，并通过野外调查、空间分析与评价实践，研究地形、气候、水土和人类活动的联系。所学知识可用于资源环境调查、生态评价、空间分析和区域研究等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "human-geography",
    "name": "人文地理与城乡规划",
    "category": "science",
    "officialCode": "070503",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "人文地理与城乡规划主要研究人口、产业及社会活动的空间分布与城乡发展。通常学习人文地理、经济地理、城乡规划、地理信息系统和社会调查等内容，并通过地区调研、空间数据处理与规划分析，认识社会活动、空间结构和公共需求。所学知识可用于城乡发展研究、空间规划、区域分析和地理信息应用等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "basic-medicine",
    "name": "基础医学",
    "category": "medicine",
    "officialCode": "100101K",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "基础医学主要研究人体生命活动、疾病机制及医学实验研究。通常学习人体解剖、生理、生物化学、病理学、免疫学和微生物学等内容，并通过医学基础实验、文献阅读与研究训练，关注实验设计、证据解释和科研规范。所学知识可用于医学基础研究、医药研发和医学教育相关领域等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "forensic-medicine",
    "name": "法医学",
    "category": "medicine",
    "officialCode": "100901K",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "法医学主要研究运用医学与自然科学知识解决司法中的专业问题。通常学习解剖、病理、法医病理、法医临床、法医物证和毒物分析等内容，并通过检验实验、案例分析与鉴定训练，重视证据链、客观判断和规范记录。所学知识可用于法医鉴定、司法技术、检验检测和相关研究等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "chinese-pharmacy",
    "name": "中药学",
    "category": "medicine",
    "officialCode": "100801",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "中药学主要研究中药的来源鉴定、药效物质、制备及质量评价。通常学习中药学、药用植物、中药鉴定、中药化学和中药制剂等内容，并通过药材鉴别、提取分析与制剂实验，理解原料质量、加工过程和药物特性。所学知识可用于中药研发、生产质量、药材检验和药学服务等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "medical-imaging-tech",
    "name": "医学影像技术",
    "category": "medicine",
    "officialCode": "101003",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "医学影像技术主要研究医学成像设备、图像获取及影像技术质量控制。通常学习解剖学、医学物理、影像设备、影像检查技术和辐射防护等内容，并通过设备操作、成像实验与技术实践，关注图像质量、检查流程及安全规范。所学知识可用于影像技术、设备应用、医疗质量控制和相关技术研发等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "optometry",
    "name": "眼视光学",
    "category": "medicine",
    "officialCode": "101004",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "眼视光学主要研究视觉功能检查、屈光矫正及眼视光技术。通常学习眼科学基础、视觉光学、视光检查、接触镜和视觉训练等内容，并通过视功能检测、验光配镜与技术实践，理解光学参数、视觉需求和使用效果。所学知识可用于眼视光技术、视功能服务、眼镜产品和相关研究等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "acupuncture",
    "name": "针灸推拿学",
    "category": "medicine",
    "officialCode": "100502K",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "针灸推拿学主要研究中医理论指导下的针灸、推拿和相关诊疗方法。通常学习中医基础、经络腧穴、针灸学、推拿学和临床医学基础等内容，并通过操作训练、病例学习与临床实践，重视解剖基础、安全规范和个体评估。所学知识可用于针灸推拿、中医康复和相关临床研究等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "agronomy",
    "name": "农学",
    "category": "other",
    "officialCode": "090101",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "农学主要研究作物生产、遗传育种和农业栽培体系。通常学习植物学、植物生理、遗传学、作物育种、栽培学和土壤学等内容，并通过田间试验、育种观察与生产调查，分析品种、环境和栽培措施对产量品质的影响。所学知识可用于作物育种、农业生产、技术推广和农业研究等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "horticulture",
    "name": "园艺",
    "category": "other",
    "officialCode": "090102",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "园艺主要研究蔬菜、果树及观赏植物的育种、栽培与采后处理。通常学习植物生理、遗传育种、园艺栽培、设施园艺和采后技术等内容，并通过栽培实验、田间调查与生产实践，研究植物生长、环境调控和产品品质。所学知识可用于园艺生产、育种、设施种植和技术服务等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "plant-protection",
    "name": "植物保护",
    "category": "other",
    "officialCode": "090103",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "植物保护主要研究植物病虫草害发生规律、诊断与综合防控。通常学习植物病理、昆虫学、微生物学、农药学和生态学等内容，并通过田间调查、病虫鉴定与防治试验，兼顾作物健康、生态安全和生产效益。所学知识可用于植物病虫监测、农业防控、农药研发和技术推广等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "animal-science",
    "name": "动物科学",
    "category": "other",
    "officialCode": "090301",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "动物科学主要研究经济动物的遗传繁育、营养和健康生产。通常学习动物遗传、育种、营养、饲料科学和动物生产等内容，并通过育种数据分析、营养试验与生产实践，协调动物生长、福利和生产效率。所学知识可用于畜牧生产、育种、饲料研发和动物营养技术等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "forestry",
    "name": "林学",
    "category": "other",
    "officialCode": "090501",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "林学主要研究森林培育、经营及森林生态保护。通常学习植物学、森林生态、林木遗传育种、森林培育和森林经理等内容，并通过资源调查、育苗与野外实践，联系森林生长、生态功能和经营方案。所学知识可用于森林经营、生态建设、资源调查和林业技术等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "animation",
    "name": "动画",
    "category": "other",
    "officialCode": "130310",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "动画主要研究动画作品的叙事、造型、运动表现和制作。通常学习绘画基础、动画原理、角色设计、分镜、视听语言和数字制作等内容，并通过故事创作、动作练习与短片项目，建立从策划到制作的完整表达流程。所学知识可用于动画制作、影视内容、游戏美术和数字创作等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "digital-media-art",
    "name": "数字媒体艺术",
    "category": "other",
    "officialCode": "130508",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "数字媒体艺术主要研究数字媒介中的艺术表达、互动体验及视觉创作。通常学习设计基础、视听语言、数字影像、交互设计和媒体艺术等内容，并通过影像创作、互动作品与跨媒介项目，探索技术、叙事和审美体验的结合。所学知识可用于数字艺术、交互内容、影视视觉和文化创意等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "environmental-design",
    "name": "环境设计",
    "category": "other",
    "officialCode": "130503",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "环境设计主要研究室内外环境的空间体验、材料应用和艺术设计。通常学习设计基础、空间设计、建筑基础、材料工艺和计算机表现等内容，并通过场地调研、模型与设计项目，协调功能需求、空间氛围和实际施工条件。所学知识可用于室内设计、展示设计、公共空间和环境艺术等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "product-design",
    "name": "产品设计",
    "category": "other",
    "officialCode": "130504",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "产品设计主要研究产品形态、使用体验及生活方式相关的设计表达。通常学习设计基础、产品造型、人机工程、材料工艺和设计研究等内容，并通过用户观察、原型制作与设计验证，在功能、审美和制造条件之间形成方案。所学知识可用于产品造型、生活用品、设计咨询和文创产品等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "musicology",
    "name": "音乐学",
    "category": "other",
    "officialCode": "130202",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "音乐学主要研究音乐理论、音乐历史及音乐教育与文化。通常学习乐理、视唱练耳、和声、音乐史和音乐分析等内容，并通过作品分析、音乐实践与文献研究，结合听觉体验、理论理解和文化背景。所学知识可用于音乐教育、文化研究、出版传播和音乐相关服务等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "physical-education",
    "name": "体育教育",
    "category": "other",
    "officialCode": "040201",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "体育教育主要研究学校体育教学、运动技能发展及学生健康促进。通常学习运动解剖、运动生理、体育心理、教学方法和专项运动等内容，并通过运动训练、教学设计与学校实践，兼顾动作技术、教学组织和安全管理。所学知识可用于学校体育、青少年运动、教学研究和体育教育服务等领域；具体课程、实践安排和培养侧重点因学校而异。"
  },
  {
    "id": "sport-training",
    "name": "运动训练",
    "category": "other",
    "officialCode": "040202K",
    "hotScore": 60,
    "strongUniversities": [],
    "description": "运动训练主要研究竞技运动的技术训练、体能发展与竞赛组织。通常学习专项运动、训练学、运动生理、运动心理和竞赛理论等内容，并通过训练计划、技术分析与竞赛实践，根据项目特点、负荷和运动表现调整方案。所学知识可用于运动训练、体育队伍、赛事组织和竞技体育相关研究等领域；具体课程、实践安排和培养侧重点因学校而异。"
  }
]

export const majorAliases: Record<string, string> = {
  "theoretical-physics": "physics",
  "applied-math": "math",
  "public-health": "preventive-medicine",
  "biomedical-engineering": "bme",
  "aerospace-engineering": "aerospace",
  "nuclear-engineering": "nuclear",
  "environmental-engineering": "env-eng",
  "food-science": "food-eng",
  "optical-engineering": "optics",
  "quantum-physics": "physics",
  "computational-biology": "bioinformatics",
  "psychology-arts": "psychology",
  "geography-science": "geography",
  "marine-science": "oceanography",
  "biotechnology-science": "biotechnology",
  "applied-chemistry-science": "applied-chem",
  "microbiology-science": "biology",
  "ecology-science": "ecology",
  "energy-power-engineering": "energy-power",
  "vehicle-engineering": "vehicle",
  "mining-engineering": "mining",
  "petroleum-engineering": "petroleum",
  "international-trade": "iet",
  "emergency-medicine": "clinical-medicine",
  "packaging-eng": "packaging",
  "printing-eng": "printing"
}

// 获取所有专业（包含用户添加的）
export function mergeApprovedMajors(userMajors: Major[]): Major[] {
  const knownNames = new Set(majors.map(major => major.name))
  const knownIds = new Set(majors.map(major => major.id))
  const categories: MajorCategory[] = ['arts', 'science', 'engineering', 'medicine', 'other']
  const additions = userMajors.filter(major => {
    if (!major || major.isApproved === false || !major.id || !major.name) return false
    if (knownNames.has(major.name) || knownIds.has(major.id) || majorAliases[major.id]) return false
    knownNames.add(major.name)
    knownIds.add(major.id)
    return true
  }).map(major => ({ ...major, category: categories.includes(major.category) ? major.category : 'other' as MajorCategory }))
  return [...majors, ...additions]
}

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
      return mergeApprovedMajors(approvedUserMajors)
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
  return all.find((m) => m.id === (majorAliases[id] ?? id))
}
















