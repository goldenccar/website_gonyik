import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { getTranslations } from '@/api/client'

export type SiteLocale = 'zh' | 'en'

export const ENGLISH_COPY: Record<string, string> = {
  '港翼科技': 'GONYIK',
  '材料科技': 'Material Science',
  '面料系列': 'Fabric Platforms',
  '产品应用': 'Applications',
  '专业支持': 'Technical Support',
  '合作咨询': 'Partner With Us',
  '系列平台': 'Fabric Platforms',
  '技术体系': 'Technology Systems',
  '核心材料': 'Core Materials',
  '工艺与验证': 'Process & Validation',
  '成衣': 'Apparel',
  '鞋履': 'Footwear',
  '配件': 'Accessories',
  '日常通勤': 'Everyday',
  '户外防护': 'Outdoor Protection',
  '专业与特种': 'Professional',
  '养护用品': 'Care Products',
  '穿戴配件': 'Wearable Accessories',
  '功能组件': 'Functional Components',
  '材料与性能支持': 'Material & Performance Support',
  '使用与养护': 'Use & Care',
  '数字面料与虚拟打样': 'Digital Fabrics & Virtual Sampling',
  '无氟技术体系': 'PFAS-Free Technology System',
  'RPO 材料平台': 'RPO Material Platform',
  'RPO 高性能材料平台': 'RPO High-Performance Materials',
  '高性能膜技术': 'High-Performance Membrane',
  '膜技术': 'Membrane Technology',
  '高性能纤维': 'High-Performance Fiber',
  '面料复合技术': 'Fabric Lamination',
  '复合技术': 'Lamination Technology',
  '供应链管理': 'Supply Chain',
  '测试与验证': 'Testing & Validation',
  '测试与认证': 'Testing & Certification',
  '查看全部材料科技': 'View All Material Science',
  '以材料科技\n重构高性能面料': 'Re-engineering performance textiles\nthrough material science',
  '港翼围绕底层材料、结构设计、制造与验证，开发面向真实应用的功能面料和材料解决方案。': 'GONYIK develops functional textiles and material solutions for real-world applications by integrating foundational materials, structural design, manufacturing and validation.',
  '探索面料系列': 'Explore Fabrics',
  '了解材料科技': 'Explore Material Science',
  '下滑探索港翼科技': 'Scroll to explore GONYIK',
  '从底层材料、复合结构到供应链协同，让无氟高性能进入可制造、可验证的面料系统。': 'From foundational materials and laminate structures to supply-chain coordination, we translate PFAS-free performance into manufacturable, verifiable textile systems.',
  '了解 RPO 材料平台': 'Explore the RPO Platform',
  '承担防水、透湿及相关防护作用': 'Waterproof, breathable and protective performance',
  '让面层、功能层与内层形成完整材料': 'Integrating face fabric, functional layer and backer',
  '协同防护、手感与耐久表现': 'Balancing protection, hand feel and durability',
  '让材料、工艺与制造条件在同一体系中协同': 'Aligning materials, processes and manufacturing',
  '支持稳定生产、验证与交付': 'Supporting stable production, validation and delivery',
  '三大面料平台': 'Three Fabric Platforms',
  '蓝标 OTTER 与银标 RAYO 面向日常及户外，黑标 KAIS 独立服务特种专业场景。': 'OTTER and RAYO serve everyday and outdoor applications, while KAIS is dedicated to professional protection.',
  '查看全部面料产品': 'View All Fabric Products',
  '新一代无氟防护': 'Next-generation PFAS-free protection',
  '专业防护平台 · 防刺/防火/防化': 'Professional protection · stab, fire and chemical resistance',
  '原生防晒 · 导湿凉感': 'Built-in UV protection · moisture management and cooling',
  '探索系列': 'Explore Platform',
  '从新的材料体系出发，重建高性能防护的结构与体验。': 'Rebuilding high-performance protection from a new material system.',
  '性能，不应以对持久性含氟化学体系的长期依赖为前提。': 'Performance should not depend on persistent fluorinated chemistry.',
  '高性能材料，需要一条新的路径': 'High-performance materials need a new path',
  '过去数十年，许多高性能防水透湿产品依赖含氟膜材料与含氟拒水整理，以获得稳定的防水、透湿和表面防护表现。/h随着部分 PFAS 的环境持久性、潜在健康影响及相关风险得到进一步确认，全球监管正在持续收紧。行业需要解决的，已经不只是去掉某一种化学品，而是在减少含氟依赖的同时，保留真正有价值的性能与穿着体验。': 'For decades, many waterproof-breathable products have relied on fluorinated membranes and water-repellent finishes for stable protection and comfort./hAs the environmental persistence and potential health impacts of certain PFAS become clearer, regulation continues to tighten. The challenge is not simply to remove one chemical, but to reduce fluorinated dependencies without giving up meaningful performance and wear comfort.',
  '环境危害': 'Environmental Persistence',
  '健康风险': 'Potential Health Impact',
  '监管收紧': 'Tighter Regulation',
  '性能要求': 'Performance Requirements',
  '从单点替代，转向系统协同': 'From single substitutions to system design',
  '无氟不是简单替换一张膜或一种整理剂。化学体系的变化，会同时影响防水、透湿、粘合、手感、耐久与制造稳定性。/h港翼把材料、结构、工艺和验证放在同一条开发路径中，让各环节围绕最终使用体验共同校准，而不是把性能压力留给某一个孤立部件。': 'PFAS-free performance is not achieved by replacing a membrane or finish in isolation. A change in chemistry affects waterproofness, breathability, bonding, hand feel, durability and manufacturing stability./hGONYIK develops materials, structures, processes and validation as one coordinated system, aligning every stage around the intended user experience.',
  '材料基础': 'Material Foundation',
  '结构与工艺': 'Structure & Process',
  '制造适配': 'Manufacturing Fit',
  '验证闭环': 'Validation Loop',
  '围绕无氟膜、高性能纤维与胶黏体系建立底层能力。': 'Building foundational capabilities in PFAS-free membranes, high-performance fibers and bonding systems.',
  '协同织物结构、复合方式与无氟功能整理。': 'Co-designing textile structures, lamination methods and PFAS-free functional finishes.',
  '把实验室方案转化为可重复、可追溯的生产条件。': 'Translating laboratory concepts into repeatable, traceable manufacturing conditions.',
  '从材料、面料到成品逐级确认性能与耐久表现。': 'Validating performance and durability from material to textile and finished product.',
  '从一片功能膜，走向完整的产品体系': 'From a functional membrane to a complete product system',
  '港翼以 RPO-SOTEX 超微孔功能膜等核心材料为基础，将织物结构、复合工艺、无氟整理与供应链协同纳入同一开发体系。/h这套体系最终形成可制造、可验证的功能面料，并进一步服务于成衣、鞋履材料和专业装备等终端应用。': 'Starting with core materials such as the RPO-SOTEX microporous membrane, GONYIK brings textile structures, lamination, PFAS-free finishing and supply-chain coordination into one development system./hThe result is a manufacturable and verifiable functional textile platform for apparel, footwear materials and professional equipment.',
  '了解 RPO 材料平台 →': 'Explore the RPO Platform →',
  '探索核心材料 →': 'Explore Core Materials →',
  '查看面料系列 →': 'View Fabric Platforms →',
  '构建防水、透湿与强度兼备的功能界面': 'A functional interface balancing waterproofness, breathability and strength',
  '水汽如何穿过一层防水膜': 'How moisture vapor crosses a waterproof membrane',
  '防水透湿膜需要完成两件看似相反的事：阻挡外部液态水，同时让人体产生的水汽持续向外释放。不同膜结构实现透湿的路径并不相同。/h传统无孔膜依靠材料对水分子的吸附、扩散与解吸完成传递；RPO-SOTEX 则在连续膜体内部形成细小、不规则且相互连通的超微孔，让水汽经孔道向外扩散。': 'A waterproof-breathable membrane must do two seemingly opposing things: block external liquid water while allowing body-generated moisture vapor to escape. Different membrane structures use different transport paths./hTraditional dense membranes rely on sorption, diffusion and desorption. RPO-SOTEX forms fine, irregular and interconnected micropores within a continuous membrane body, allowing vapor to diffuse through the pore network.',
  '传统无孔结构': 'Traditional Dense Structure',
  '吸湿—扩散—解吸': 'Sorption — diffusion — desorption',
  'RPO-SOTEX 超微孔结构': 'RPO-SOTEX Microporous Structure',
  '连通微孔—直接传递': 'Connected micropores — direct transport',
  '膜层厚度': 'Membrane thickness',
  '膜层厚度小于 5 微米': 'Membrane thickness below 5 microns',
  '透气膜怎么防水': 'How a breathable membrane blocks water',
  '水汽可以沿连通微孔向外扩散，液态水面对的却是另一套界面条件。RPO-SOTEX 的疏水微孔远小于液滴，水在孔口形成弯月面；只有当外部水压超过孔隙对应的进入压力，液态水才可能进入膜层。/h因此，防水能力并不是把孔完全封死，而是通过材料表面性质、孔径分布与膜层均匀性共同建立稳定的液态水屏障。': 'Moisture vapor can diffuse through connected micropores, while liquid water encounters a different interfacial condition. RPO-SOTEX hydrophobic pores are far smaller than a droplet, creating a meniscus at each pore opening; liquid can enter only when external pressure exceeds the corresponding entry pressure./hWaterproofness therefore does not require sealing every pore. It is established through surface properties, pore-size distribution and membrane uniformity working together.',
  '超微孔膜阻挡液态水的结构示意': 'Diagram of a microporous membrane blocking liquid water',
  '液态水': 'Liquid water',
  '外部压力作用于膜面': 'External pressure acts on the membrane',
  '孔口毛细阻力': 'Capillary resistance at pore openings',
  '液态水停留在超微孔之外': 'Liquid water remains outside the micropores',
  '尺度差': 'Scale Difference',
  '液滴尺度远大于连通微孔': 'Droplets are far larger than connected micropores',
  '超低表面能': 'Ultra-Low Surface Energy',
  '降低液态水对膜面的润湿倾向': 'Reduces the tendency of liquid water to wet the membrane',
  '进入压力阻止液态水穿透': 'Entry pressure prevents liquid-water penetration',
  '液滴停留在 RPO-SOTEX 超微孔膜表面': 'A water droplet resting on the RPO-SOTEX microporous membrane surface',
  '一张膜，需要同时成立的性能': 'The capabilities a membrane must deliver together',
  'RPO-SOTEX 基于增韧聚烯烃材料体系与微孔结构调控，将无氟材料本体、连通超微孔和高强韧膜体结合在同一结构中。/h它追求的不是某一个孤立指标的峰值，而是在复合加工与长期使用中，持续维持防水、透湿、强韧和耐候之间的平衡。': 'RPO-SOTEX combines a toughened polyolefin material system, connected micropores and a strong membrane body in one PFAS-free structure./hRather than maximizing one isolated metric, it is engineered to sustain a balance of waterproofness, breathability, toughness and weathering resistance through lamination and long-term use.',
  '材料本体无氟': 'PFAS-Free Material Body',
  '超微孔直接传递': 'Direct Micropore Transport',
  '强韧与耐候基础': 'Toughness & Weathering',
  '采用无氟聚烯烃材料体系，从核心膜层减少对含氟材料的依赖，并已通过 SGS PFAS-Free 检测。': 'A PFAS-free polyolefin system reduces fluorinated dependencies at the core membrane layer and has passed SGS PFAS-Free testing.',
  '膜体内部形成细小、连续的微孔结构，为水汽提供直接的传递通道，减少对材料吸湿扩散过程的依赖。': 'Fine, connected micropores provide a direct pathway for vapor transport and reduce reliance on sorption-diffusion mechanisms.',
  '高强韧膜体为后续复合加工、反复弯折、磨损和环境变化中的稳定表现提供材料基础。': 'A tough membrane body supports stable performance through lamination, repeated flexing, abrasion and environmental change.',
  '让纤维本身承担防护性能': 'Making the fiber itself part of the protection system',
  '面向二维功能材料开发的高可靠复合体系': 'Reliable lamination engineered for two-dimensional functional materials',
  '让技术方案稳定进入规模制造': 'Translating technical solutions into stable scale manufacturing',
  '从材料研发到第三方验证': 'From material development to independent validation',
  '连接底层材料技术与面料应用': 'Connecting foundational materials with textile applications',
  '按使用环境，找到合适的材料': 'Find the right material for the environment',
  '从日常与户外使用到特种专业场景，查看材料系列、具体型号与验证依据。': 'Explore fabric platforms, specific constructions and validation references for everyday, outdoor and professional use.',
  '查看港翼面料在成衣、鞋履与配件中的应用，以及材料与产品之间的对应关系。': 'See how GONYIK textiles are applied in apparel, footwear and accessories.',
  '围绕材料选用、数字打样与使用养护，为产品开发和长期使用提供支持。': 'Support for material selection, digital sampling, product development and long-term care.',
  '联系我们': 'Contact',
  '如有材料需求或合作意向，欢迎与我们取得联系。': 'Contact us to discuss material requirements and potential collaboration.',
  '隐私政策': 'Privacy Policy',
  '材料与应用': 'Materials & Applications',
  '服务与支持': 'Services & Support',
  '联系': 'Contact',
  '材料与合作咨询': 'Materials & Partnership Enquiries',
  '当前技术': 'Current',
  '选择技术': 'Select a technology',
  '专注无氟高性能面料与专业防护材料，围绕膜技术、面料复合、功能整理与测试验证，为日常户外及特种专业场景提供材料解决方案。': 'PFAS-free performance textiles and protective materials integrating membrane technology, lamination, functional finishing and validation for outdoor and professional applications.',
  '微信': 'WeChat',
  '小红书': 'Xiaohongshu',
  '抖音': 'Douyin',
  '查看微信账号': 'View WeChat account',
  '查看小红书账号': 'View Xiaohongshu account',
  '查看抖音账号': 'View Douyin account',
  '微信二维码': 'WeChat QR code',
  '小红书二维码': 'Xiaohongshu QR code',
  '抖音二维码': 'Douyin QR code',
  '© 2026 港翼科技 GONYIK 版权所有': '© 2026 GONYIK. All rights reserved.',
  '服务内容': 'Services',
  '支持主流数字服装工作流': 'Supports leading digital apparel workflows',
  '视觉数据': 'Visual Data',
  '颜色、纹理、法线与表面表现，支持虚拟样衣的材料呈现。': 'Color, texture, normal and surface data for realistic digital garment rendering.',
  '物理属性': 'Physical Properties',
  '基于具体面料测试与软件参数体系，记录弯曲、拉伸、剪切等属性。': 'Bending, stretch and shear properties recorded against fabric tests and software parameters.',
  '版本交付': 'Versioned Delivery',
  '文件与面料型号、批次及软件版本对应，避免数字材料与实物信息脱节。': 'Files are tied to fabric models, batches and software versions to keep digital and physical materials aligned.',
  '需要指定面料的数字模型？': 'Need a digital model for a specific fabric?',
  '请提供目标面料型号、使用软件与应用场景，我们将为项目匹配相应的数字面料文件与技术资料。': 'Share the target fabric, software and application so we can match the appropriate digital material files and technical data.',
  '提交需求': 'Submit a Request',
  '性能': 'Performance',
  '重量': 'Weight',
  '手感': 'Hand Feel',
  '日常': 'Everyday',
  '专业': 'Professional',
  '轻盈': 'Light',
  '强韧': 'Robust',
  '柔软': 'Soft',
  '挺括': 'Structured',
  '核心性能': 'Core Performance',
  '翻面查看性能': 'Flip to view performance',
  '返回正面': 'Return to front',
  '数据为代表性样品典型值，具体规格、测试方法与适用条件以对应 TDS 为准。': 'Values shown are typical representative-sample data. Refer to the corresponding TDS for specifications, test methods and conditions of use.',
  '获取完整 TDS': 'Request Full TDS',
  '耐久防水': 'Durable Waterproofness',
  '高透湿': 'High Moisture Permeability',
  '全天候防护': 'All-Weather Protection',
  '防水性': 'Waterproofness',
  '透湿性': 'Moisture Permeability',
  '防风性': 'Windproofness',
  '耐候性': 'Weather Resistance',
  '透气性': 'Air Permeability',
  '防晒性': 'UV Protection',
  '吸湿排汗': 'Moisture Wicking',
  '速干性': 'Quick Drying',
  '耐磨性': 'Abrasion Resistance',
  '邮箱': 'Email',
  '电话': 'Phone',
  '地址': 'Address',
  '姓名 *': 'Name *',
  '公司 / 机构 *': 'Company / Organization *',
  '邮箱 *': 'Email *',
  '电话（选填）': 'Phone (optional)',
  '联系目的 *': 'Purpose of Enquiry *',
  '需求说明（至少 10 个字）*': 'Project requirements (minimum 10 characters) *',
  '提交中…': 'Submitting…',
  '提交咨询': 'Submit Enquiry',
  '持久存在并可能长期累积': 'Persistent and potentially accumulative',
  '部分 PFAS 存在潜在健康威胁': 'Certain PFAS may present potential health risks',
  '主要市场限制持续强化': 'Restrictions continue to tighten across major markets',
  '关键防护体验不能退让': 'Essential protective performance cannot be compromised',
  '获取适用型号的 TDS 与测试资料': 'Request model-specific TDS and test data',
  '在 RPO-SOTEX 平台中，高性能纤维并不只是功能膜的支撑材料。针对高强、耐磨、轻量和专业防护需求，纤维本身可以承担载荷分散、结构增强和抗切割等核心作用，直接决定面料的基础性能边界。/h港翼根据不同应用选择纤维材料、纱线规格和织物组织，并协同织造、染整与后整理工艺，在强度、克重、手感、柔韧性和耐久性之间建立适合最终产品的结构方案。高性能纤维可以独立形成防护材料，也可以与功能膜共同构成多层系统。': 'Within the RPO-SOTEX platform, high-performance fiber is more than a support for a functional membrane. For high-strength, abrasion-resistant, lightweight and professional protection applications, the fiber itself can distribute loads, reinforce structures and improve cut resistance—setting the fundamental performance boundary of the textile./hGONYIK selects fiber materials, yarn specifications and textile constructions for each application, coordinating weaving, dyeing and finishing to balance strength, weight, hand feel, flexibility and durability. High-performance fibers can form standalone protective textiles or work with functional membranes in multilayer systems.',
  'RPO-SOTEX 二维功能材料具有轻薄、连续和界面敏感等特点，传统复合参数难以直接套用。港翼围绕其表面特性和形变方式，适配开发胶黏体系、施胶结构与层间结合工艺，使面层、功能层和底布形成稳定协同。/h从胶黏剂选择、胶点结构到温度、压力、速度和张力，港翼建立面向 RPO-SOTEX 的专用工艺窗口，并通过批次管理和过程控制维持复合一致性，在层间可靠性、透湿表现、手感和长期耐用性之间取得平衡。': 'RPO-SOTEX two-dimensional functional materials are thin, continuous and interface-sensitive, so conventional lamination parameters cannot simply be copied. GONYIK develops compatible adhesive systems, application patterns and interlayer bonding processes around their surface characteristics and deformation behavior, enabling the face fabric, functional layer and backer to work as one stable structure./hFrom adhesive selection and dot geometry to temperature, pressure, speed and tension, GONYIK establishes a dedicated process window for RPO-SOTEX. Batch management and process control maintain consistency while balancing interlayer reliability, breathability, hand feel and long-term durability.',
  '技术只有能够被重复制造，才具备产品价值。港翼协同原料、纺纱、织造、染整和复合环节，对材料规格、生产批次、工艺条件与质量要求进行持续管理，使研发阶段确认的方案能够稳定进入样品开发和批量生产。/h港翼将材料可追溯性、质量管理能力、环境表现和持续交付能力作为供应链选择的重要标准。核心合作伙伴具备 bluesign®、GRS、OEKO-TEX® 等与其材料和生产环节相匹配的认证与合规能力，共同建立可靠、透明且可持续的材料供应体系。': 'A technology creates product value only when it can be manufactured repeatedly. GONYIK coordinates raw materials, spinning, weaving, dyeing, finishing and lamination, continuously managing specifications, production batches, process conditions and quality requirements so that validated development concepts can move reliably into sampling and volume production./hMaterial traceability, quality-management capability, environmental performance and continuity of supply are central to partner selection. Core partners maintain relevant certifications and compliance capabilities, including bluesign®, GRS and OEKO-TEX®, supporting a reliable, transparent and more sustainable material supply system.',
  '港翼结合材料研发实验室、香港科技大学（广州）多功能高聚物薄膜中央实验室及合作实验条件，对原料、纤维、膜材、复合结构、工艺窗口和耐久表现开展分阶段测试。/h从实验室配方、材料小样和工艺试制，到量产批次与成品性能，港翼通过连续测试确认技术方案的稳定性。对于防水、透湿、耐磨及专业防护等关键指标，可根据项目要求委托 SGS、中纺标 CTTC 等机构进行独立检测，使材料性能建立在可重复、可验证的数据基础之上。': 'GONYIK combines its material-development laboratories with the Central Laboratory for Multifunctional Polymer Films at the Hong Kong University of Science and Technology (Guangzhou) and other collaborative facilities to test raw materials, fibers, membranes, laminate structures, process windows and durability in stages./hFrom laboratory formulations and material samples to process trials, production batches and finished-product performance, continuous testing verifies technical stability. Key metrics such as waterproofness, breathability, abrasion resistance and professional protection can be independently tested by organizations including SGS and CTTC, grounding performance claims in repeatable, verifiable data.',
  '高性能面料的能力，首先来自底层材料。RPO 材料平台围绕 RPO-SOTEX 超微孔功能膜、RPO高性能纤维展开，通过对材料结构、形态与加工适配性的持续开发，在轻量、强度、耐久与功能界面之间建立新的性能基础。/h港翼根据不同应用，将 RPO 材料与织物结构、无氟整理和复合工艺协同设计，使材料从实验室形态进入可制造、可验证的面料系统，并进一步服务于防水透湿、轻量防护、高强耐磨等产品方向。': 'The capability of a high-performance textile begins with its foundational materials. The RPO material platform centers on the RPO-SOTEX microporous functional membrane and RPO high-performance fibers, continuously developing material structures, forms and process compatibility to establish a new performance foundation across low weight, strength, durability and functional interfaces./hFor each application, GONYIK co-designs RPO materials with textile structures, PFAS-free finishing and lamination processes, translating laboratory materials into manufacturable and verifiable textile systems for waterproof-breathable, lightweight protective and high-strength abrasion-resistant products.',
  '港翼通过 RPO-SOTEX 无氟超微孔纳米膜构建连续、轻薄的功能界面。膜内相互连通的超微孔为气态水分子的扩散提供通道；面对液态水时，疏水孔隙结构与水的表面张力共同形成毛细阻力，使液体需要达到一定进入压力才能穿透膜层。/h除了防水与水汽传递能力，RPO 纳米膜本身也具有突出的物理性能。其材料结构在极低密度下仍可达到接近部分铝合金等级的拉伸强度，呈现优异的比强度、耐拉伸表现和结构稳定性，为轻量面料与高可靠防护结构提供更大的设计空间。/h膜材的最终表现还取决于孔隙分布、厚度、均匀性，以及与面层、底布和复合工艺的匹配。港翼围绕膜材制备、结构控制与应用适配持续开发，使 RPO-SOTEX 功能层能够稳定进入不同面料系统。': 'GONYIK uses the PFAS-free RPO-SOTEX microporous nanomembrane to create a continuous, lightweight functional interface. Interconnected micropores provide pathways for moisture vapor, while hydrophobic pores and water surface tension create capillary resistance against liquid penetration./hBeyond waterproofness and vapor transport, the RPO membrane provides strong physical performance. Its low-density material structure delivers high specific strength, tensile resistance and structural stability, expanding design freedom for lightweight textiles and reliable protective constructions./hFinal membrane performance also depends on pore distribution, thickness, uniformity and compatibility with face fabrics, backers and lamination processes. GONYIK continues to develop membrane preparation, structural control and application fit so RPO-SOTEX can enter different textile systems consistently.',
}

interface SiteLocaleContextValue {
  locale: SiteLocale
  t: (text?: string | null) => string
  path: (href: string) => string
  switchPath: string
}

const SiteLocaleContext = createContext<SiteLocaleContextValue>({
  locale: 'zh',
  t: (text) => text || '',
  path: (href) => href,
  switchPath: '/en',
})

export function stripEnglishPrefix(pathname: string) {
  if (pathname === '/en') return '/'
  return pathname.startsWith('/en/') ? pathname.slice(3) : pathname
}

export function localizePath(href: string, locale: SiteLocale) {
  if (!href || /^(?:https?:|mailto:|tel:|#)/.test(href) || href.startsWith('/admin')) return href
  const [pathnameAndQuery, hash = ''] = href.split('#')
  const base = stripEnglishPrefix(pathnameAndQuery)
  const localized = locale === 'en' ? `/en${base === '/' ? '' : base}` : base
  return `${localized}${hash ? `#${hash}` : ''}`
}

export function SiteLocaleProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const locale: SiteLocale = location.pathname === '/en' || location.pathname.startsWith('/en/') ? 'en' : 'zh'
  const [cmsEnglishCopy, setCmsEnglishCopy] = useState<Record<string, string>>({})

  useEffect(() => {
    if (locale !== 'en') return
    getTranslations('en')
      .then((response) => setCmsEnglishCopy(response.data.data || {}))
      .catch(() => setCmsEnglishCopy({}))
  }, [locale])

  const value = useMemo<SiteLocaleContextValue>(() => ({
    locale,
    t(text) {
      if (!text) return ''
      return locale === 'en' ? cmsEnglishCopy[text] || ENGLISH_COPY[text] || text : text
    },
    path(href) {
      return localizePath(href, locale)
    },
    switchPath: locale === 'en'
      ? `${stripEnglishPrefix(location.pathname)}${location.search}${location.hash}`
      : `/en${location.pathname === '/' ? '' : location.pathname}${location.search}${location.hash}`,
  }), [cmsEnglishCopy, locale, location.hash, location.pathname, location.search])

  return <SiteLocaleContext.Provider value={value}>{children}</SiteLocaleContext.Provider>
}

export function useSiteLocale() {
  return useContext(SiteLocaleContext)
}
