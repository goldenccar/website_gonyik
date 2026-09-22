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
        "items": []
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
