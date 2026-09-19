import type { TechnologyContentBlock } from '../types'

// Initial CMS content only. Public pages render the saved CMS data without replacing it.
export const RPO_CONTENT: Record<string, { title: string; subtitle: string; image_url: string; eyebrow: string; hero_visual: string; hero_link: string; hero_scroll_label: string; content: string; content_blocks: TechnologyContentBlock[] }> = {
  "rpo-material-platform": {
    "title": "RPO TECHNOLOGY",
    "subtitle": "港翼的材料与面料开发平台。膜、纤维、复合技术，以及配套的供应链和测试。",
    "image_url": "/visuals/technology-rpo-platform-hero-v1.webp",
    "content_blocks": [
      {
        "key": "platform-capabilities",
        "title": "膜、纤维与复合",
        "content": "从原料选择、织物设计到复合加工，为不同用途开发面料。",
        "items": [
          {
            "title": "膜技术",
            "content": "RPO-SOTEX 功能膜，用于防水透湿面料。",
            "visual": "membrane",
            "image_url": "",
            "link_url": "/pfas-free-innovation/rpo-sotex-membrane"
          },
          {
            "title": "高性能纤维",
            "content": "纤维选择、纱线组合与织物设计。",
            "visual": "image",
            "image_url": "/visuals/technology-fiber-material-v1.webp",
            "link_url": "/pfas-free-innovation/high-performance-fiber"
          },
          {
            "title": "复合技术",
            "content": "将不同材料复合，调整成品的功能与手感。",
            "visual": "lamination",
            "image_url": "",
            "link_url": "/pfas-free-innovation/lamination"
          }
        ],
        "layout": "cards",
        "tone": "",
        "links": []
      },
      {
        "key": "delivery",
        "title": "从样品到量产",
        "content": "打样、测试、调整，再确定生产规格。",
        "items": [
          {
            "title": "供应链",
            "content": "协调原料、织造、染整和复合的开发与生产。",
            "visual": "supply",
            "image_url": "",
            "link_url": "/pfas-free-innovation/supply-chain",
            "link_label": "了解供应链"
          },
          {
            "title": "测试与认证",
            "content": "样品对比、性能测试与第三方检测。",
            "visual": "image",
            "image_url": "/visuals/technology-testing-hero-v2.jpg",
            "link_url": "/pfas-free-innovation/testing-certification",
            "link_label": "了解测试与认证"
          }
        ],
        "layout": "delivery",
        "tone": "mist",
        "links": []
      },
      {
        "key": "material-choice",
        "title": "材料与化学品要求",
        "content": "膜、纤维、整理剂与复合用胶，都需要符合项目的材料要求。RPO-SOTEX 的材料说明及检测信息见膜技术页。",
        "layout": "note",
        "tone": "",
        "links": [
          {
            "label": "查看 RPO-SOTEX",
            "href": "/pfas-free-innovation/rpo-sotex-membrane#material-testing"
          }
        ]
      },
      {
        "key": "series",
        "title": "面料系列",
        "content": "",
        "layout": "series",
        "tone": "",
        "links": [],
        "items": [
          {
            "title": "OTTER",
            "content": "适用于冲锋衣、雨衣等户外服装。",
            "image_url": "/uploads/1781366172477-254637203.png",
            "link_url": "/fabrics/series/otter"
          },
          {
            "title": "RAYO",
            "content": "适用于防晒衣、垂钓披风及轻户外服装。",
            "image_url": "/uploads/1783927272832-864591800.jpg",
            "link_url": "/fabrics/series/rayo"
          },
          {
            "title": "KAIS",
            "content": "用于防护服装、手套及其他需要加强防护的部位。",
            "image_url": "/uploads/1783927258734-23082948.jpg",
            "link_url": "/fabrics/series/kais"
          }
        ]
      }
    ],
    "eyebrow": "GONYIK / RPO TECHNOLOGY",
    "hero_visual": "image",
    "hero_scroll_label": "了解平台能力",
    "hero_link": "#platform-capabilities",
    "content": ""
  },
  "rpo-sotex-membrane": {
    "title": "RPO-SOTEX 膜技术",
    "subtitle": "以聚烯烃材料与超微孔结构，构建防水、透湿与强韧兼备的功能界面",
    "image_url": "/visuals/technology-membrane-production-hero-v1.webp",
    "content_blocks": [
      {
        "key": "material-testing",
        "layout": "intro",
        "title": "",
        "content": "RPO-SOTEX 以聚烯烃材料与超微孔结构实现防水透湿，不依赖含氟膜材料体系。经 SGS 对数百种目标 PFAS 进行检测，结果均未检出。",
        "note": "“未检出”指报告所列目标物低于相应方法检出限，具体检测范围以技术资料为准。"
      },
      {
        "key": "transport-mechanism",
        "title": "水汽如何穿过一层防水膜",
        "content": "防水透湿膜需要完成两件看似相反的事：阻挡外部液态水，同时让人体产生的水汽持续向外释放。不同膜结构实现透湿的路径并不相同。/h传统无孔膜依靠材料对水分子的吸附、扩散与解吸完成传递；RPO-SOTEX 则在连续膜体内部形成细小、不规则且相互连通的超微孔，让水汽经孔道向外扩散。",
        "layout": "comparison",
        "items": [
          {
            "title": "传统无孔结构",
            "content": "吸湿—扩散—解吸",
            "image_url": "/visuals/pfas-microstructure-dense-v3.webp"
          },
          {
            "title": "RPO-SOTEX 超微孔结构",
            "content": "连通微孔—直接传递",
            "image_url": "/visuals/pfas-microstructure-porous-v4.webp",
            "caption": "膜层厚度 < 5 μm"
          }
        ]
      },
      {
        "key": "waterproof-mechanism",
        "title": "透气膜怎么防水",
        "content": "水汽可以沿连通微孔向外扩散，液态水面对的却是另一套界面条件。RPO-SOTEX 的疏水微孔远小于液滴，水在孔口形成弯月面；只有当外部水压超过孔隙对应的进入压力，液态水才可能进入膜层。/h因此，防水能力并不是把孔完全封死，而是通过材料表面性质、孔径分布与膜层均匀性共同建立稳定的液态水屏障。",
        "layout": "feature",
        "tone": "mist",
        "image_url": "/visuals/membrane-waterproof-mechanism-v1.jpg",
        "caption": "液滴停留在 RPO-SOTEX 超微孔膜表面",
        "items": [
          {
            "title": "尺度差",
            "content": "液滴尺度远大于连通微孔"
          },
          {
            "title": "超低表面能",
            "content": "降低液态水对膜面的润湿倾向"
          },
          {
            "title": "孔口毛细阻力",
            "content": "进入压力阻止液态水穿透"
          }
        ]
      },
      {
        "key": "performance-foundation",
        "title": "一张膜，需要同时成立的性能",
        "content": "RPO-SOTEX 基于增韧聚烯烃材料体系与微孔结构调控，将聚烯烃材料、连通超微孔和高强韧膜体结合在同一结构中。/h它追求的不是某一个孤立指标的峰值，而是在复合加工与长期使用中，持续维持防水、透湿、强韧和耐候之间的平衡。",
        "items": [
          {
            "title": "减少含氟依赖",
            "content": "RPO-SOTEX 采用聚烯烃材料体系，从核心膜层减少对含氟材料的依赖。经 SGS 对数百种目标 PFAS 进行检测，结果均未检出。"
          },
          {
            "title": "超微孔直接传递",
            "content": "膜体内部形成细小、连续的微孔结构，为水汽提供直接的传递通道，减少对材料吸湿扩散过程的依赖。"
          },
          {
            "title": "强韧与耐候基础",
            "content": "高强韧膜体为后续复合加工、反复弯折、磨损和环境变化中的稳定表现提供材料基础。"
          }
        ],
        "layout": "feature",
        "visual": "membrane",
        "caption": "RPO-SOTEX 超微孔功能膜"
      }
    ],
    "eyebrow": "GONYIK / RPO TECHNOLOGY",
    "hero_visual": "image",
    "hero_scroll_label": "",
    "hero_link": "",
    "content": ""
  },
  "high-performance-fiber": {
    "title": "高性能纤维",
    "subtitle": "从纤维配方到织物结构，让轻量与防护建立在材料本体之上。",
    "image_url": "/visuals/technology-fiber-production-hero-v2.webp",
    "content_blocks": [
      {
        "key": "fiber-formula",
        "title": "高性能，来自于正确的纤维配方",
        "content": "一块面料的强度、重量、触感与耐用性，在织造成形之前就已经从纤维开始。港翼根据使用环境，将 RPO 高性能纤维与其他高品质纤维组合，并进一步匹配纱线规格与织物组织，让不同材料各自承担增强、耐磨、弹性或舒适的作用。/h这套配方由拥有二十余年织造与染整经验的核心纺织合作伙伴共同转化为稳定的织物结构。",
        "highlights": [
          "RPO 高性能纤维",
          "其他高品质纤维",
          "纱线与织物组织"
        ],
        "layout": "split",
        "image_url": "/visuals/technology-fiber-material-v1.webp",
        "caption": "纤维、纱线与织物结构示意"
      },
      {
        "key": "fiber-specific-strength",
        "title": "更轻的结构，仍然保留防护余量",
        "content": "RPO 高性能纤维具有突出的比强度、耐磨性与耐候基础，可在较低材料重量下提供有效增强。面向轻量防护、高磨损区域或需要长期使用的产品，港翼通过纤维比例与组织密度的调整，把材料能力放在真正需要的位置。",
        "items": [
          {
            "title": "高比强度",
            "content": "以更少的材料重量，为织物提供有效的承载与增强基础。"
          },
          {
            "title": "耐磨增强",
            "content": "针对高接触、高摩擦区域，提高织物抵抗持续磨耗的能力。"
          },
          {
            "title": "耐候基础",
            "content": "为户外暴露、反复使用和复杂环境中的性能保持提供材料基础。"
          }
        ],
        "layout": "columns",
        "tone": "mist"
      }
    ],
    "eyebrow": "GONYIK / RPO TECHNOLOGY",
    "hero_visual": "image",
    "hero_scroll_label": "",
    "hero_link": "",
    "content": ""
  },
  "lamination": {
    "title": "面料复合技术",
    "subtitle": "让面层、功能层与内层在同一套工艺窗口中可靠协同。",
    "image_url": "/visuals/technology-lamination-hero-v1.webp",
    "content_blocks": [
      {
        "key": "lamination-interface",
        "title": "三层材料，最终成为一块面料",
        "content": "面层决定外观、触感与表面防护，RPO-SOTEX 功能膜承担防水透湿，内层则影响贴肤体验与结构保护。真正的复合不是简单地把三层粘在一起，而是让它们在弯折、拉伸、湿热与持续穿着中保持协同。",
        "highlights": [
          "面层",
          "RPO-SOTEX 功能膜",
          "内层"
        ],
        "layout": "split",
        "visual": "lamination",
        "caption": ""
      },
      {
        "key": "lamination-window",
        "title": "为 RPO-SOTEX 建立专属复合工艺",
        "content": "RPO-SOTEX 的材料特性使传统复合参数难以直接套用。港翼围绕胶黏剂体系、施胶结构、温度与压力、速度与张力持续建立专属工艺窗口，使层间结合达到可靠水平，同时保留膜层的透湿能力、面料手感与耐久表现。",
        "items": [
          {
            "title": "可靠结合",
            "content": "使面层、功能层与内层在反复使用中维持完整结构。"
          },
          {
            "title": "保留透湿",
            "content": "控制施胶形态与覆盖关系，避免功能通道被不必要地占用。"
          },
          {
            "title": "兼顾手感",
            "content": "让复合后的面料仍具有适合具体产品的柔软度与活动自由度。"
          },
          {
            "title": "面向耐久",
            "content": "围绕湿热、弯折与洗护条件，持续优化层间稳定性。"
          }
        ],
        "layout": "matrix",
        "tone": "navy"
      },
      {
        "key": "lamination-development",
        "layout": "note",
        "title": "复合工艺与材料开发",
        "content": "面层、功能层与内层的搭配，需要与具体用途、手感和性能要求一起确定。",
        "links": [
          {
            "label": "咨询复合技术",
            "href": "/contact?topic=咨询复合开发&source=lamination"
          }
        ]
      }
    ],
    "eyebrow": "GONYIK / RPO TECHNOLOGY",
    "hero_visual": "image",
    "hero_scroll_label": "",
    "hero_link": "",
    "content": ""
  },
  "supply-chain": {
    "title": "供应链管理",
    "subtitle": "把材料、织造、染整与复合能力组织成可追溯的生产链路。",
    "image_url": "/visuals/technology-supply-chain-hero-v1.webp",
    "content_blocks": [
      {
        "key": "supply-chain",
        "title": "让材料能力沿着产业链完整传递",
        "content": "一块高性能面料，来自纤维、织造、染整、功能膜与复合工艺的连续协同。港翼把底层材料开发与成熟纺织制造能力连接起来，让每一个生产环节都围绕最终应用共同工作。",
        "layout": "split",
        "visual": "supply"
      },
      {
        "key": "supply-foundation",
        "title": "二十余年的纺织经验",
        "content": "核心纺织合作伙伴长期积累的织造与染整能力，为纤维选择、织物开发、颜色与手感控制提供成熟基础。港翼在此基础上引入 RPO-SOTEX 功能膜与无氟技术路径，把新的材料能力转化为可制造的面料产品。",
        "highlights": [
          "纤维与纱线",
          "织造与染整",
          "功能膜",
          "复合与成品"
        ],
        "layout": "split",
        "tone": "mist",
        "image_url": "/visuals/technology-fiber-production-hero-v2.webp",
        "caption": "织造与染整能力，与功能材料开发相衔接"
      },
      {
        "key": "supply-assurance",
        "title": "材料信息与品质依据，同步进入开发过程",
        "content": "港翼优选具备 bluesign®、GRS、OEKO-TEX® 认证基础的面料与供应链合作伙伴。具体适用范围以对应产品资料为准。",
        "layout": "logos",
        "items": [
          {
            "title": "bluesign",
            "content": "",
            "image_url": "/uploads/1785658131306-08e5b0c2-816b-4b49-806b-3e6b4fc42830.png"
          },
          {
            "title": "OEKO-TEX",
            "content": "",
            "image_url": "/uploads/1785658146022-20221f09-015d-411c-8f42-9c81107959c5.jpg"
          },
          {
            "title": "Global Recycled Standard",
            "content": "",
            "image_url": "/uploads/1785658162991-718d2b7b-41ef-4df3-bf75-4431246d3105.png"
          }
        ],
        "links": [
          {
            "label": "咨询材料与供应链",
            "href": "/contact?topic=联系港翼&source=supply-chain"
          }
        ]
      }
    ],
    "eyebrow": "GONYIK / RPO TECHNOLOGY",
    "hero_visual": "image",
    "hero_scroll_label": "",
    "hero_link": "",
    "content": ""
  },
  "testing-certification": {
    "title": "测试与认证",
    "subtitle": "从材料到成品面料，持续验证产品表现",
    "image_url": "/visuals/technology-testing-hero-v2.jpg",
    "content_blocks": [
      {
        "key": "testing-chain",
        "layout": "split",
        "title": "材料与面料测试",
        "content": "从防水透湿到强度、耐磨与耐久，港翼通过测试比较材料和样品表现。根据项目需要，委托 SGS、中纺标 CTTC 等机构进行独立检测。",
        "image_url": "/visuals/technology-testing-hero-v1.webp",
        "caption": "面料测试场景示意",
        "links": [
          {
            "label": "咨询测试资料",
            "href": "/contact?topic=咨询测试资料&source=testing-certification"
          }
        ]
      }
    ],
    "eyebrow": "GONYIK / RPO TECHNOLOGY",
    "hero_visual": "image",
    "hero_scroll_label": "",
    "hero_link": "",
    "content": ""
  }
}

export const RPO_LABELS = {
  "overview": "RPO TECHNOLOGY",
  "platform": "探索 RPO 技术平台",
  "contact": "咨询材料开发",
  "laminateContact": "咨询复合开发",
  "productionContact": "联系港翼",
  "testContact": "咨询测试资料"
}

export const RPO_ENGLISH: Record<string,string> = {
  "材料与面料测试": "Material and fabric testing",
  "从防水透湿到强度、耐磨与耐久，港翼通过测试比较材料和样品表现。根据项目需要，委托 SGS、中纺标 CTTC 等机构进行独立检测。": "GONYIK tests and compares materials and samples for waterproofness, breathability, strength, abrasion resistance and durability. Independent testing by organizations such as SGS and CTTC is commissioned as required by each project.",
  "二十余年的纺织经验": "Over twenty years of textile experience",
  "面料测试场景示意": "Fabric testing illustration",
  "港翼围绕材料筛选、结构开发、样品对比与耐久表现开展内部测试。 /h从防水透湿、耐磨强度到弯折耐久，围绕功能面料的关键表现开展测试。": "GONYIK conducts internal testing for material selection, construction development, sample comparison and durability./hTests cover key fabric properties, from waterproofness and breathability to abrasion resistance, strength and flex durability.",
  "让面层、功能层与内层在同一套工艺窗口中可靠协同。": "Bringing face fabric, functional layer and backing together within a reliable processing window.",
  "三层材料，最终成为一块面料": "Three layers become one fabric",
  "面层决定外观、触感与表面防护，RPO-SOTEX 功能膜承担防水透湿，内层则影响贴肤体验与结构保护。真正的复合不是简单地把三层粘在一起，而是让它们在弯折、拉伸、湿热与持续穿着中保持协同。": "The face fabric determines appearance, feel and surface protection. The RPO-SOTEX membrane provides waterproofness and breathability, while the backing influences next-to-skin comfort and structural protection. Lamination must keep these layers working together through flexing, stretching, heat, humidity and extended wear.",
  "RPO-SOTEX 功能膜": "RPO-SOTEX functional membrane",
  "内层": "Backing",
  "面层 / RPO-SOTEX 功能膜 / 内层": "Face fabric / RPO-SOTEX membrane / Backing",
  "为 RPO-SOTEX 建立专属复合工艺": "Lamination developed for RPO-SOTEX",
  "RPO-SOTEX 的材料特性使传统复合参数难以直接套用。港翼围绕胶黏剂体系、施胶结构、温度与压力、速度与张力持续建立专属工艺窗口，使层间结合达到可靠水平，同时保留膜层的透湿能力、面料手感与耐久表现。": "RPO-SOTEX's material properties require adjustments to conventional lamination parameters. GONYIK develops a dedicated processing window around adhesive systems, application patterns, temperature, pressure, speed and tension to achieve reliable bonding while preserving breathability, fabric feel and durability.",
  "可靠结合": "Reliable bonding",
  "使面层、功能层与内层在反复使用中维持完整结构。": "Keeping the face fabric, functional layer and backing together through repeated use.",
  "保留透湿": "Preserving breathability",
  "控制施胶形态与覆盖关系，避免功能通道被不必要地占用。": "Controlling adhesive patterns and coverage to avoid unnecessarily obstructing moisture pathways.",
  "兼顾手感": "Maintaining fabric feel",
  "让复合后的面料仍具有适合具体产品的柔软度与活动自由度。": "Retaining the softness and freedom of movement needed for the intended product.",
  "面向耐久": "Designed for durability",
  "围绕湿热、弯折与洗护条件，持续优化层间稳定性。": "Refining layer stability under heat, humidity, flexing and care conditions.",
  "复合工艺与材料开发": "Lamination and material development",
  "面层、功能层与内层的搭配，需要与具体用途、手感和性能要求一起确定。": "Define the face fabric, functional layer and backing together with the intended use, feel and performance requirements.",
  "咨询复合技术": "Discuss lamination",
  "把材料、织造、染整与复合能力组织成可追溯的生产链路。": "Connecting materials, weaving, finishing and lamination in a traceable production chain.",
  "让材料能力沿着产业链完整传递": "Connecting material development with production",
  "一块高性能面料，来自纤维、织造、染整、功能膜与复合工艺的连续协同。港翼把底层材料开发与成熟纺织制造能力连接起来，让每一个生产环节都围绕最终应用共同工作。": "High-performance fabrics depend on coordination between fibers, weaving, finishing, functional membranes and lamination. GONYIK connects material development with established textile manufacturing capabilities, aligning each production stage with the end use.",
  "二十余年的纺织经验，进入新的材料体系": "Over twenty years of textile experience, applied to new materials",
  "核心纺织合作伙伴长期积累的织造与染整能力，为纤维选择、织物开发、颜色与手感控制提供成熟基础。港翼在此基础上引入 RPO-SOTEX 功能膜与无氟技术路径，把新的材料能力转化为可制造的面料产品。": "Our core textile partners bring established weaving and finishing capabilities to fiber selection, fabric development, color and feel control. GONYIK builds on this foundation with RPO-SOTEX membranes and fluorine-free technology, translating material capabilities into fabrics that can be manufactured.",
  "纤维与纱线": "Fibers and yarns",
  "织造与染整": "Weaving and finishing",
  "复合与成品": "Lamination and finished fabrics",
  "织造与染整能力，与功能材料开发相衔接": "Weaving and finishing connected with functional material development",
  "材料信息与品质依据，同步进入开发过程": "Material information and quality documentation",
  "港翼优选具备 bluesign®、GRS、OEKO-TEX® 认证基础的面料与供应链合作伙伴。具体适用范围以对应产品资料为准。": "GONYIK prioritizes fabric and supply-chain partners with bluesign®, GRS or OEKO-TEX® certification credentials. The applicable scope is defined by the documentation for each product.",
  "咨询材料与供应链": "Discuss materials and supply",
  "从材料到成品面料，持续验证产品表现": "Verifying performance from materials to finished fabrics",
  "验证，从单项材料开始": "Verification begins with the material",
  "港翼围绕材料筛选、结构开发、样品对比与耐久表现开展内部测试。": "GONYIK conducts internal testing for material selection, construction development, sample comparison and durability.",
  "材料测试实验室": "Materials testing laboratory",
  "材料筛选": "Material selection",
  "结构开发": "Construction development",
  "样品对比": "Sample comparison",
  "耐久表现": "Durability",
  "从内部实验，到独立第三方验证": "From internal testing to independent verification",
  "根据具体产品与项目要求，由 SGS、中纺标 CTTC 等专业机构进行独立检测。": "Independent testing is carried out by organizations such as SGS and CTTC according to the requirements of each product and project.",
  "材料与结构验证": "Material and construction testing",
  "样品与耐久对比": "Sample and durability comparison",
  "独立第三方检测": "Independent third-party testing",
  "从防水透湿、耐磨强度到弯折耐久，围绕功能面料的关键表现开展测试。": "Testing key fabric properties, from waterproofness and breathability to abrasion resistance, strength and flex durability.",
  "通过内部测试比较材料、结构与样品表现，为开发调整提供依据。": "Comparing materials, constructions and samples through internal testing to inform development.",
  "根据具体产品与项目要求，安排独立检测。": "Independent testing arranged for the requirements of the specific product and project.",
  "中纺标 CTTC": "CTTC",
  "从性能数据，到产品选择": "From performance data to material selection",
  "防水、透湿、耐磨、强度与耐久等关键表现，最终都要服务于真实产品。港翼为品牌提供面料型号、性能信息与技术支持，帮助开发团队更快比较方案、确认选材并推进打样。": "Waterproofness, breathability, abrasion resistance, strength and durability must serve the finished product. GONYIK provides fabric references, performance information and technical support to help development teams compare options, select materials and move into sampling.",
  "咨询面料测试资料": "Request fabric testing information",
  "开发与生产": "Development and production",
  "从户外穿着到专业防护，按使用需求了解面料。": "Explore fabrics for outdoor clothing and professional protection.",
  "OTTER 系列": "OTTER",
  "RAYO 系列": "RAYO",
  "KAIS 系列": "KAIS",
  "防晒与轻户外": "Sun protection and light outdoor wear",
  "从面料到成品，了解材料在不同产品中的应用。": "Explore how materials are used in finished products.",
  "材料选用、数字打样与使用养护。": "Material selection, digital sampling and product care.",
  "材料选择与性能信息": "Material selection and performance information",
  "清洁、使用与保养": "Cleaning, use and care",
  "面料数字化与产品开发": "Digital fabrics and product development",
  "从纤维配方到织物结构，让轻量与防护建立在材料本体之上。": "From fiber blends to textile structures, building lightweight protection into the material itself.",
  "高性能，来自于正确的纤维配方": "Performance starts with the right fiber blend",
  "一块面料的强度、重量、触感与耐用性，在织造成形之前就已经从纤维开始。港翼根据使用环境，将 RPO 高性能纤维与其他高品质纤维组合，并进一步匹配纱线规格与织物组织，让不同材料各自承担增强、耐磨、弹性或舒适的作用。/h这套配方由拥有二十余年织造与染整经验的核心纺织合作伙伴共同转化为稳定的织物结构。": "A fabric's strength, weight, feel and durability begin with its fibers, before weaving. GONYIK combines RPO high-performance fibers with other quality fibers for the intended environment, matching yarn specifications and textile structures so each material contributes reinforcement, abrasion resistance, stretch or comfort./hOur core textile partners, with more than twenty years of weaving and finishing experience, help turn these blends into consistent textile structures.",
  "RPO 高性能纤维": "RPO high-performance fibers",
  "其他高品质纤维": "Other quality fibers",
  "纱线与织物组织": "Yarn and textile structures",
  "更轻的结构，仍然保留防护余量": "Lighter structures with room for protection",
  "RPO 高性能纤维具有突出的比强度、耐磨性与耐候基础，可在较低材料重量下提供有效增强。面向轻量防护、高磨损区域或需要长期使用的产品，港翼通过纤维比例与组织密度的调整，把材料能力放在真正需要的位置。": "RPO high-performance fibers offer high specific strength, abrasion resistance and a foundation for weather resistance, providing reinforcement at a low material weight. For lightweight protection, high-wear areas and products designed for extended use, GONYIK adjusts fiber proportions and textile density to place performance where it is needed.",
  "高比强度": "High specific strength",
  "以更少的材料重量，为织物提供有效的承载与增强基础。": "Supporting load-bearing and reinforcement with less material weight.",
  "耐磨增强": "Abrasion reinforcement",
  "针对高接触、高摩擦区域，提高织物抵抗持续磨耗的能力。": "Improving resistance to sustained wear in areas exposed to frequent contact and friction.",
  "耐候基础": "Weather resistance",
  "为户外暴露、反复使用和复杂环境中的性能保持提供材料基础。": "A material foundation for retaining performance during outdoor exposure, repeated use and demanding conditions.",
  "以聚烯烃材料与超微孔结构，构建防水、透湿与强韧兼备的功能界面": "Combining polyolefin materials and microporous structures for waterproofness, breathability and toughness",
  "RPO-SOTEX 以聚烯烃材料与超微孔结构实现防水透湿，不依赖含氟膜材料体系。经 SGS 对数百种目标 PFAS 进行检测，结果均未检出。": "RPO-SOTEX combines polyolefin materials with a microporous structure for waterproofness and breathability, without relying on fluorinated membrane materials. SGS testing found none of the hundreds of targeted PFAS above their detection limits.",
  "“未检出”指报告所列目标物低于相应方法检出限，具体检测范围以技术资料为准。": "Not detected means that the substances listed in the report were below the respective method detection limits. Refer to the technical documentation for the scope of testing.",
  "水汽如何穿过一层防水膜": "How moisture vapor crosses a waterproof membrane",
  "防水透湿膜需要完成两件看似相反的事：阻挡外部液态水，同时让人体产生的水汽持续向外释放。不同膜结构实现透湿的路径并不相同。/h传统无孔膜依靠材料对水分子的吸附、扩散与解吸完成传递；RPO-SOTEX 则在连续膜体内部形成细小、不规则且相互连通的超微孔，让水汽经孔道向外扩散。": "A waterproof, breathable membrane must keep liquid water out while allowing moisture vapor from the body to escape. Different membrane structures achieve this transport in different ways./hConventional nonporous membranes transfer moisture through sorption, diffusion and desorption. RPO-SOTEX forms small, irregular, interconnected micropores within a continuous membrane, allowing moisture vapor to diffuse through the pore network.",
  "传统无孔结构": "Conventional nonporous structure",
  "吸湿—扩散—解吸": "Sorption — diffusion — desorption",
  "RPO-SOTEX 超微孔结构": "RPO-SOTEX microporous structure",
  "连通微孔—直接传递": "Interconnected pores — direct transport",
  "膜层厚度 < 5 μm": "Membrane thickness < 5 μm",
  "透气膜怎么防水": "How a breathable membrane keeps water out",
  "水汽可以沿连通微孔向外扩散，液态水面对的却是另一套界面条件。RPO-SOTEX 的疏水微孔远小于液滴，水在孔口形成弯月面；只有当外部水压超过孔隙对应的进入压力，液态水才可能进入膜层。/h因此，防水能力并不是把孔完全封死，而是通过材料表面性质、孔径分布与膜层均匀性共同建立稳定的液态水屏障。": "Moisture vapor can diffuse through interconnected micropores, while liquid water encounters different interface conditions. RPO-SOTEX's hydrophobic pores are much smaller than water droplets. Water forms a meniscus at each pore opening and can enter the membrane only when external pressure exceeds the corresponding entry pressure./hWaterproofness therefore depends on surface properties, pore-size distribution and membrane uniformity working together to form a stable liquid-water barrier, rather than sealing every pore.",
  "液滴停留在 RPO-SOTEX 超微孔膜表面": "Water droplets on the RPO-SOTEX microporous membrane",
  "尺度差": "Difference in scale",
  "液滴尺度远大于连通微孔": "Droplets are much larger than the interconnected micropores",
  "超低表面能": "Very low surface energy",
  "降低液态水对膜面的润湿倾向": "Reducing the tendency of liquid water to wet the membrane",
  "孔口毛细阻力": "Capillary resistance at pore openings",
  "进入压力阻止液态水穿透": "Entry pressure resists liquid-water penetration",
  "一张膜，需要同时成立的性能": "Performance that must work together",
  "RPO-SOTEX 基于增韧聚烯烃材料体系与微孔结构调控，将聚烯烃材料、连通超微孔和高强韧膜体结合在同一结构中。/h它追求的不是某一个孤立指标的峰值，而是在复合加工与长期使用中，持续维持防水、透湿、强韧和耐候之间的平衡。": "RPO-SOTEX combines toughened polyolefin materials, controlled interconnected micropores and a strong, tough membrane in one structure./hThe aim is a sustained balance of waterproofness, breathability, toughness and weather resistance through lamination and extended use, rather than a peak result in a single metric.",
  "减少含氟依赖": "Less reliance on fluorinated materials",
  "RPO-SOTEX 采用聚烯烃材料体系，从核心膜层减少对含氟材料的依赖。经 SGS 对数百种目标 PFAS 进行检测，结果均未检出。": "RPO-SOTEX uses a polyolefin material system to reduce reliance on fluorinated materials in the core membrane. SGS testing found none of the hundreds of targeted PFAS above their detection limits.",
  "超微孔直接传递": "Direct transport through micropores",
  "膜体内部形成细小、连续的微孔结构，为水汽提供直接的传递通道，减少对材料吸湿扩散过程的依赖。": "Small, continuous micropores provide direct pathways for moisture vapor, reducing reliance on moisture sorption and diffusion through the material.",
  "强韧与耐候基础": "Toughness and weather resistance",
  "高强韧膜体为后续复合加工、反复弯折、磨损和环境变化中的稳定表现提供材料基础。": "A strong, tough membrane provides a foundation for stable performance through lamination, repeated flexing, wear and changing environmental conditions.",
  "RPO-SOTEX 超微孔功能膜": "RPO-SOTEX microporous functional membrane",
  "RAYO · 柔软度 / 悬垂": "RAYO · Softness / drape",
  "开发与验证": "Development & validation",
  "纤维配方与织物结构": "Fiber blends & textile structures",
  "材料搭配与复合工艺": "Material combinations & lamination",
  "性能测试与第三方检测": "Performance & independent testing",
  "纤维、纱线与织物结构示意": "Fiber, yarn and textile structure illustration",
  "RPO TECHNOLOGY": "RPO TECHNOLOGY",
  "港翼的材料与面料开发平台。膜、纤维、复合技术，以及配套的供应链和测试。": "The GONYIK platform for materials and fabric development. Membranes, fibers and lamination, supported by production and testing.",
  "膜、纤维与复合": "Membranes, fibers & lamination",
  "从原料选择、织物设计到复合加工，为不同用途开发面料。": "Fabric development for different uses, from material selection and textile design to lamination.",
  "膜技术": "Membrane technology",
  "RPO-SOTEX 功能膜，用于防水透湿面料。": "RPO-SOTEX functional membranes for waterproof-breathable fabrics.",
  "高性能纤维": "High-performance Fibers",
  "纤维选择、纱线组合与织物设计。": "Fiber selection, yarn combinations and textile design.",
  "复合技术": "Lamination Technology",
  "将不同材料复合，调整成品的功能与手感。": "Combining materials to shape fabric performance and feel.",
  "从样品到量产": "From sampling to production",
  "打样、测试、调整，再确定生产规格。": "Sample, test and refine, then define production specifications.",
  "供应链": "Supply Chain",
  "协调原料、织造、染整和复合的开发与生产。": "Coordinating materials, weaving, finishing and lamination.",
  "测试与认证": "Testing & Certification",
  "样品对比、性能测试与第三方检测。": "Sample comparisons, performance testing and independent laboratory results.",
  "材料与化学品要求": "Materials & chemical requirements",
  "膜、纤维、整理剂与复合用胶，都需要符合项目的材料要求。RPO-SOTEX 的材料说明及检测信息见膜技术页。": "Membranes, fibers, finishes and adhesives are selected against project requirements. See the membrane page for RPO-SOTEX material and testing information.",
  "面料系列": "Fabric series",
  "RPO-SOTEX 膜技术": "RPO-SOTEX Membrane Technology",
  "为防水透湿面料开发的功能膜。": "A functional membrane developed for waterproof-breathable fabrics.",
  "防水，也让水汽通过": "Water resistance. Moisture transport.",
  "RPO-SOTEX 通过微孔结构阻隔液态水、传递水汽。复合成面料后，面层、内层和粘合方式也会影响表现，因此需要对成品重新测试。": "The microporous structure of RPO-SOTEX resists liquid water while transporting moisture vapor. Face fabric, backing and bonding also affect the finished fabric, which is tested as a complete construction.",
  "膜与面料，分别测试": "Testing membranes and finished fabrics",
  "膜的检测结果不能直接代替成品面料的结果。选材时，需要对应具体的样品、结构与测试方法。": "Membrane results do not replace finished-fabric results. Selection considers the specimen, construction and test method.",
  "功能膜": "Functional membrane",
  "材料组成、微孔结构及相关化学品检测。": "Material composition, microporous structure and chemical testing.",
  "复合面料": "Laminated fabric",
  "复合后的防水、透湿及耐久表现。": "Waterproofness, breathability and durability after lamination.",
  "用于 OTTER 系列": "Used in OTTER fabrics",
  "查看防水透湿面料的用途与选择。": "Explore applications and options for waterproof-breathable fabrics.",
  "用纤维、纱线和织物结构，做出面料需要的性能与手感。": "Fibers, yarns and textile structures selected for the performance and feel a fabric needs.",
  "性能从选材开始": "Performance starts with materials",
  "防晒衣与防护服装，对材料的要求不同。纤维种类、纱线规格和织物组织，需要按用途选择。": "Sun-protective clothing and protective garments have different needs. Fiber types, yarn specifications and textile structures are selected for the intended use.",
  "纤维选择": "Fiber selection",
  "按用途选择纤维，比较强度、重量、触感与加工适应性。": "Select fibers for the application, comparing strength, weight, feel and processing suitability.",
  "纱线组合": "Yarn combinations",
  "选择纱线规格与组合，确定织造用料。": "Select yarn specifications and combinations for textile production.",
  "织物结构": "Textile structure",
  "调整组织与密度，打样比较功能和手感。": "Adjust weave and density, then compare function and feel through samples.",
  "材料的用途": "Material applications",
  "防晒与导湿": "Sun protection & moisture management",
  "用于防晒衣、垂钓披风等服装，考虑日晒、出汗时的穿着需求。": "For sun-protective clothing and fishing capes, considering wear in sun and during perspiration.",
  "强度与耐磨": "Strength & abrasion resistance",
  "用于易磨损或需要补强的部位，按强度、耐磨和重量要求选材。": "For high-wear areas and reinforcement, selecting for strength, abrasion resistance and weight.",
  "专业防护": "Professional protection",
  "按防割、防刺等用途设计材料结构，并对成品送样测试。": "Designing constructions for uses such as cut and stab protection, followed by finished-sample testing.",
  "相关面料系列": "Related fabric series",
  "材料怎么搭、怎么贴合，决定了面料的功能、手感与耐用程度。": "Material combinations and bonding influence fabric performance, feel and durability.",
  "先看手感，再做复合": "Start with the feel",
  "客户带来一件垂钓防晒披风，希望复合后仍有相近的手感，并增加功能。港翼已完成样品，正在这类用途上继续开发。": "A customer brought in a sun-protective fishing cape, asking for a similar feel after lamination with added function. GONYIK has made samples and continues to develop for this use.",
  "不同用途，不同结构": "Constructions for different uses",
  "面料、膜和功能夹层按用途组合。以下为结构示意，实际材料与层数随产品调整。": "Fabrics, membranes and interlayers are combined for each use. These are schematic constructions; materials and layer counts vary by product.",
  "防水透湿": "Waterproof & breathable",
  "面料与功能膜复合，按用途选配内层。成品需测试防水、透湿与层间结合表现。": "Fabric laminated to a functional membrane, with backing selected for the use. Finished constructions are tested for waterproofness, breathability and bonding.",
  "轻户外与手感": "Light outdoor use & feel",
  "根据柔软度、悬垂与功能要求，选择材料与贴合方式。": "Materials and bonding selected for softness, drape and functional needs.",
  "将织物与功能夹层组合，按具体防护用途测试成品。": "Textiles combined with functional interlayers and tested for the intended protective use.",
  "复合后的三项检查": "After lamination",
  "用胶、温度、压力与张力都会影响复合结果。打样时，既要看粘合是否牢固，也要看功能和手感有没有改变。": "Adhesive, temperature, pressure and tension affect lamination. Sampling checks bond strength as well as changes in function and feel.",
  "层间结合": "Layer bonding",
  "检查粘合牢度，以及使用后的分层情况。": "Check bond strength and separation after use.",
  "功能保持": "Functional performance",
  "测试复合后是否仍达到目标性能。": "Test whether the laminated fabric meets the performance target.",
  "成品手感": "Finished fabric feel",
  "与参考样对比柔软度、挺括和悬垂。": "Compare softness, body and drape with the reference sample.",
  "有参考样品，开发更具体": "Have a reference sample?",
  "告诉我们用途、手感和性能要求，一起确定打样方案。": "Share the use, feel and performance requirements to define a sampling brief.",
  "协调原料、织造、染整与复合，让确认的样品进入生产。": "Coordinating materials, weaving, finishing and lamination to bring approved samples into production.",
  "开发与生产流程": "Development & production",
  "先确定产品要求，再选材、打样与测试。样品确认后，核对量产规格和排期。": "Define requirements, then select materials, sample and test. Confirm production specifications and scheduling after sample approval.",
  "明确需求": "Define requirements",
  "确认用途、手感、重点性能和开发计划。": "Confirm the use, feel, key performance needs and development schedule.",
  "选材打样": "Select and sample",
  "安排材料组合，协调织造、染整及复合打样。": "Arrange material combinations and coordinate weaving, finishing and lamination samples.",
  "样品确认": "Confirm samples",
  "对照目标检查性能与外观，调整方案并确认样品。": "Check performance and appearance against the brief, refine and confirm the sample.",
  "量产准备": "Prepare production",
  "核对材料规格、生产安排与检验要求。": "Confirm material specifications, production arrangements and inspection requirements.",
  "一份要求，落实到各道工序": "One brief, across every process",
  "原料规格、织造组织、染整和复合工艺需要相互配合。港翼协调各环节，把样品中确认的颜色、手感与性能要求落实到生产。": "Material specifications, textile structure, finishing and lamination need to work together. GONYIK coordinates these stages around the color, feel and performance agreed in the sample.",
  "量产前确认": "Before production",
  "样品与规格": "Samples & specifications",
  "对齐确认样品、材料规格及允许偏差。": "Align approved samples, material specifications and tolerances.",
  "工艺与外观": "Process & appearance",
  "核对加工方式、颜色、手感和外观要求。": "Confirm processing methods, color, feel and appearance requirements.",
  "性能与检验": "Performance & inspection",
  "明确检测项目、方法及验收依据。": "Define test items, methods and acceptance criteria.",
  "告诉我们你的生产计划": "Discuss your production plans",
  "产品用途、预计用量、交付时间，是安排打样与生产的起点。": "Application, expected volume and delivery timing inform sampling and production plans.",
  "材料好不好，用具体样品的测试结果说话。": "Assessing materials through the test results of specific samples.",
  "开发测试与第三方检测": "Development & independent testing",
  "开发时对比不同样品，确定材料与工艺。需要独立结果时，按项目要求安排第三方检测。": "Compare samples to define materials and processes during development. Arrange independent laboratory testing to meet project requirements.",
  "开发测试": "Development testing",
  "比较材料、结构和工艺变化后的样品，判断下一步怎么调整。": "Compare samples after changes to materials, construction and process to guide the next adjustment.",
  "第三方检测": "Independent laboratory testing",
  "按项目要求送检，检测结果对应具体样品和方法。": "Submit samples for project testing, with results tied to the specimen and method.",
  "测试项目": "Test categories",
  "根据面料用途选择项目，并明确样品、方法和条件。": "Select tests for the intended use, with defined specimens, methods and conditions.",
  "防水与透湿": "Waterproofness & breathability",
  "阻水能力与水汽传递。": "Resistance to water and moisture vapor transport.",
  "紫外线防护与织物水分传递。": "UV protection and moisture transport.",
  "织物强度及反复摩擦后的磨损。": "Fabric strength and wear from repeated friction.",
  "层间结合与耐久": "Bonding & durability",
  "粘合牢度，以及使用后的性能变化。": "Bond strength and changes in performance after use.",
  "按防护用途对成品进行测试。": "Finished-product testing for the protective application.",
  "查询具体面料的测试资料": "Request fabric testing information",
  "告诉我们产品用途或面料型号，我们会提供相应的性能信息。": "Tell us the intended use or fabric reference to discuss the relevant performance information.",
  "材料与工艺": "Materials & processes",
  "开发与交付": "Development & delivery",
  "了解更多": "Explore",
  "探索 RPO 技术平台": "Explore the RPO Technology Platform",
  "了解平台能力": "Explore the platform",
  "了解膜技术": "Explore membrane technology",
  "了解高性能纤维": "Explore high-performance fibers",
  "了解复合技术": "Explore lamination",
  "了解供应链": "Explore the supply chain",
  "了解测试与认证": "Explore testing & certification",
  "查看 RPO-SOTEX": "Explore RPO-SOTEX",
  "探索 OTTER": "Explore OTTER",
  "探索 RAYO": "Explore RAYO",
  "探索 KAIS": "Explore KAIS",
  "咨询材料开发": "Discuss material development",
  "咨询复合开发": "Discuss lamination development",
  "联系港翼": "Contact GONYIK",
  "咨询测试资料": "Enquire about testing information",
  "探索面料系列": "Explore fabric series",
  "结构示意": "Construction illustration",
  "材料组合示意": "Material combination illustration",
  "纤维与织物结构示意": "Fiber and textile structure illustration",
  "外侧液态水": "Liquid water outside",
  "内侧水汽": "Moisture vapor inside",
  "面层": "Face fabric",
  "可选内层": "Optional backing",
  "材料组合": "Material combination",
  "织物": "Textile",
  "功能夹层": "Functional interlayer",
  "目标手感": "Target feel",
  "柔软度": "Softness",
  "悬垂": "Drape",
  "功能需求": "Functional needs",
  "膜、纤维与复合技术，以及供应链和测试。": "Membranes, fibers and lamination, with production and testing.",
  "适用于冲锋衣、雨衣等户外服装。": "For shell jackets, rainwear and other outdoor clothing.",
  "适用于防晒衣、垂钓披风及轻户外服装。": "For sun-protective clothing, fishing capes and light outdoor wear.",
  "用于防护服装、手套及其他需要加强防护的部位。": "For protective clothing, gloves and areas requiring additional protection."
}
