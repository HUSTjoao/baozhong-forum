import type { Major } from './majors'

// A curated expansion of commonly explored directions; not a popularity ranking.
// Names and codes follow the 2026 undergraduate catalog. Display groups stay concise.
export const additionalMajors: Major[] = [
  {
    id: 'digital-economy', name: '数字经济', officialCode: '020109T', category: 'arts',
    description: '数字经济研究数字技术、数据要素与经济活动之间的关系，关注平台经济、产业数字化以及数字市场的运行机制。通常学习微观与宏观经济学、统计学、计量经济学、数字经济理论及数据分析，并通过案例和实证研究理解技术应用对企业、消费者和社会的影响。所学知识可用于产业研究、商业分析、数字业务运营与相关政策研究；不同学校在经济理论、数据工具和产业实践上的侧重点有所不同。',
    hotScore: 0, strongUniversities: [],
  },
  {
    id: 'big-data-management', name: '大数据管理与应用', officialCode: '120108T', category: 'arts',
    description: '大数据管理与应用把管理问题与数据分析方法结合起来，研究如何利用数据支持组织决策和业务改进。通常学习管理学、运筹学、统计学、数据库、程序设计和商业数据分析，并通过数据整理、建模及业务案例理解数据质量与决策目标之间的联系。所学知识可用于商业分析、运营优化、数据治理和企业数字化项目；具体课程中管理与计算机技术的比重因学校而异。',
    hotScore: 0, strongUniversities: [],
  },
  {
    id: 'cross-border-ecommerce', name: '跨境电子商务', officialCode: '120803T', category: 'arts',
    description: '跨境电子商务研究不同国家和地区之间的在线交易、市场运营与服务协同，连接国际贸易、数字平台和物流供应链。通常学习国际贸易、电子商务、市场营销、跨境物流、商务沟通及数据分析，并通过选品、运营方案和交易流程案例理解不同市场的需求与规则。所学知识可用于跨境业务运营、国际市场分析、数字营销和供应链协调；语言能力、行业知识与实际项目经验也需要持续积累。',
    hotScore: 0, strongUniversities: [],
  },
  {
    id: 'supply-chain-management', name: '供应链管理', officialCode: '120604T', category: 'arts',
    description: '供应链管理从整体上研究采购、生产、库存、运输和交付如何协同，关注成本、服务水平与业务韧性之间的平衡。通常学习管理学、运筹学、采购管理、生产运营、物流管理及供应链数据分析，并通过流程设计和仿真处理供需变化与资源约束。所学知识可用于采购分析、生产计划、供应链运营和物流协同；具体岗位还需要结合行业特点与实际业务流程理解。',
    hotScore: 0, strongUniversities: [],
  },
  {
    id: 'intelligent-construction', name: '智能建造', officialCode: '081008T', category: 'engineering',
    description: '智能建造把土木工程与数字技术、自动化方法结合起来，研究建设项目从设计到施工和运维的协同。通常学习工程力学、土木工程基础、工程管理、建筑信息模型和工程数据处理，并通过数字模型、施工组织与现场案例理解技术如何回应安全、质量和进度要求。所学知识可用于工程数字化、智慧施工、建设技术管理和基础设施运维；工程现场经验与规范意识同样重要。',
    hotScore: 0, strongUniversities: [],
  },
  {
    id: 'intelligent-sensing', name: '智能感知工程', officialCode: '080303T', category: 'engineering',
    description: '智能感知工程研究如何通过传感器、测量系统和信息处理获得可靠的环境与设备状态信息。通常学习传感器原理、电路、信号处理、测控技术、程序设计及智能感知方法，并通过数据采集、标定和多传感器实验分析噪声、误差与系统可靠性。所学知识可用于智能装备、工业检测、环境监测和感知系统开发；不同应用场景对精度、实时性与安全性的要求各不相同。',
    hotScore: 0, strongUniversities: [],
  },
  {
    id: 'intelligent-vehicle', name: '智能车辆工程', officialCode: '080214T', category: 'engineering',
    description: '智能车辆工程研究车辆系统与感知、控制、计算技术的融合，关注车辆智能化与人车环境之间的协同。通常学习车辆构造、汽车动力学、控制理论、传感器和嵌入式系统，并通过模型仿真、系统集成与测试理解感知结果、决策策略和执行机构之间的关系。所学知识可用于智能网联车辆、车辆控制、系统测试和相关装备研发；真实道路应用需要严格验证安全性与运行边界。',
    hotScore: 0, strongUniversities: [],
  },
  {
    id: 'new-energy-vehicle', name: '新能源汽车工程', officialCode: '080216T', category: 'engineering',
    description: '新能源汽车工程研究新能源汽车的整车构造、动力系统与运行控制，关注车辆性能、能量利用和系统安全。通常学习车辆工程、电工电子、电机与控制、动力电池及整车能量管理，并通过性能计算、仿真与试验理解电池、电驱和整车之间的协同。所学知识可用于新能源汽车设计、动力系统开发、整车测试及工程技术支持；不同学校的技术路线与实践条件有所差异。',
    hotScore: 0, strongUniversities: [],
  },
  {
    id: 'smart-grid-information', name: '智能电网信息工程', officialCode: '080602T', category: 'engineering',
    description: '智能电网信息工程研究电力系统与通信、计算和自动控制技术的结合，关注电网状态感知、信息交互与协调运行。通常学习电路、电力系统分析、自动控制、通信技术及电力信息系统，并通过仿真和实验理解新能源接入、负荷变化与电网运行之间的联系。所学知识可用于电网信息化、配用电技术、能源系统分析和相关设备开发；电力安全与工程规范是学习和实践的重要基础。',
    hotScore: 0, strongUniversities: [],
  },
  {
    id: 'new-energy-materials', name: '新能源材料与器件', officialCode: '080414T', category: 'engineering',
    description: '新能源材料与器件研究能源转换、存储与利用所需的材料及器件，连接材料结构、制备工艺和器件性能。通常学习材料科学、物理化学、半导体与电化学基础、能源材料和器件测试，并通过制备、表征及性能实验理解效率、稳定性和使用条件之间的关系。所学知识可用于电池材料、光电器件、能源材料分析及相关研发；具体研究对象和课程安排因学校而异。',
    hotScore: 0, strongUniversities: [],
  },
  {
    id: 'unmanned-aircraft-systems', name: '无人驾驶航空器系统工程', officialCode: '082009T', category: 'engineering',
    description: '无人驾驶航空器系统工程从系统层面研究无人航空器、地面控制、通信链路与任务载荷之间的协同。通常学习飞行原理、飞行器结构、自动控制、导航与通信及系统工程，并通过仿真、集成与规范化试验理解任务需求和运行限制。所学知识可用于无人航空器系统研发、测试集成和行业应用技术支持；不同学校的培养侧重点不同，专业学习也需要重视运行安全与规范。',
    hotScore: 0, strongUniversities: [],
  },
  {
    id: 'low-altitude-engineering', name: '低空技术与工程', officialCode: '140003TK', category: 'engineering',
    description: '低空技术与工程面向低空飞行活动中的技术与系统问题，融合航空器、感知通信、控制和工程应用等知识。学习内容通常涉及低空飞行器系统、导航与感知、自主控制、系统运行及相关工程基础，并通过具体应用场景理解装备、运行条件与安全约束之间的关系。所学知识可用于低空系统研发、行业应用、测试验证及工程技术管理；该专业具有交叉特点，具体培养方向应结合各校方案了解。',
    hotScore: 0, strongUniversities: [],
  },
  {
    id: 'intelligent-medical-engineering', name: '智能医学工程', officialCode: '140011TK', category: 'medicine',
    description: '智能医学工程融合医学基础、人工智能与工程技术，研究医疗健康场景中的信息分析、智能设备和技术系统。通常学习人体相关基础知识、程序设计、信号与图像处理、医学统计及机器学习，并通过数据分析和工程项目理解医疗需求、技术验证与隐私保护。所学知识可用于医学数据分析、医疗技术研发和健康信息系统等领域；其培养路径与临床医学不同，具体课程和学位要求应查看学校方案。',
    hotScore: 0, strongUniversities: [],
  },
  {
    id: 'dental-technology', name: '口腔医学技术', officialCode: '101006', category: 'medicine',
    description: '口腔医学技术侧重口腔修复工艺、材料和数字化制作技术，关注口腔修复体如何满足功能、精度与美学要求。通常学习口腔基础知识、口腔材料、修复工艺、形态美学及数字化设计制造，并通过模型、设计和加工实践培养细致的工艺分析能力。所学知识可用于义齿设计制作、口腔材料与设备技术支持及相关研发；它与口腔医学的培养目标和职业路径不同，应结合学校方案理解。',
    hotScore: 0, strongUniversities: [],
  },
  {
    id: 'sports-rehabilitation', name: '运动康复', officialCode: '040206T', category: 'other',
    description: '运动康复研究运动科学与功能恢复训练的结合，关注人体运动能力、运动损伤相关问题和科学训练支持。通常学习运动解剖、生理学、运动生物力学、运动评估及康复训练方法，并在规范指导下通过观察、测量和实践理解个体差异与训练安排。所学知识可用于运动健康服务、体能与功能训练支持及相关研究；它与医学门类中的康复治疗学不同，具体培养要求和实践范围应查看学校方案。',
    hotScore: 0, strongUniversities: [],
  },
]

// Include the previously added airworthiness major in the next targeted deployment.
export const recentMajorIds = ['aircraft-airworthiness', ...additionalMajors.map(major => major.id)]
