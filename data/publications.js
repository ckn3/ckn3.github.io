window.PUBLICATIONS_DATA = {
  "abstracts": {
    "Center-guided Classifier for Semantic Segmentation of Remote Sensing Images": "Compared with natural images, remote sensing images (RSIs) have the unique characteristic, i.e., larger intraclass variance, which makes semantic segmentation for remote sensing images more challenging. Moreover, existing semantic segmentation models for remote sensing images usually employ a vanilla softmax classifier, which has three drawbacks: (1) non-direct supervision for the pixel representations during training; (2) inadequate modeling ability of parametric softmax classifiers under large intraclass variance; and (3) opaque process of classification decision. In this paper, we propose a novel classifier (called CenterSeg) customized for RSI semantic segmentation, which solves the abovementioned problems with multiple prototypes, direct supervision under Grassmann manifold, and interpretability strategy. Specifically, for each class, our CenterSeg obtains local class centers by aggregating corresponding pixel features based on ground-truth masks, and generates multiple prototypes through hard attention assignment and momentum updating. In addition, we introduce the Grassmann manifold and constrain the joint embedding space of pixel features and prototypes based on two additional regularization terms. Especially, during the inference, CenterSeg can further provide interpretability to the model by restricting the prototype as a sample of the training set. Experimental results on three remote sensing segmentation datasets validate the effectiveness of the model. Besides the superior performance, CenterSeg has the advantages of simplicity, lightweight, compatibility, and interpretability.",
    "DecodeShare: Tracing the Shared Subspace of LLM Decode-Time Decisions": "Large language models (LLMs) handle many tasks with one set of parameters, but under KV-cached inference it is unclear what task-general structure, if any, is used at decode time rather than during prefill. We propose DECODESHARE, a protocol that identifies a low-dimensional subspace that is consistently shared across tasks in decode-time hidden states, and then tests its causal role by removing that subspace only during decoding. In our experiments, disturbing the discovered shared subspace degrades decision performance far more than disturbing either a prefill-derived subspace or a random subspace under the same intervention budget. We further find that this decode-shared subspace overlaps common steering vectors, enabling a simple offline adjustment: projecting steering vectors away from the shared subspace can reduce template sensitivity while preserving non-random task utility, with task-dependent trade-offs. Despite being compact, the shared subspace can serve as a high-leverage causal channel at decode time.",
    "Learning Where to Embed: Noise-Aware Positional Embedding for Query Retrieval in Small-Object Detection": "Transformer-based detectors have advanced small-object detection, but they often remain inefficient and vulnerable to background-induced query noise. This work presents HELP, a noise-aware positional-semantic fusion framework that studies where to embed positional information by preserving positional cues in foreground-salient regions while suppressing background clutter. It introduces Heatmap-guided Positional Embedding for both encoder and decoder stages, combines it with a gradient-based mask filter for cleaner query retrieval, and integrates Linear-Snake Convolution to enrich retrieval-relevant representations. The result is a lighter detector that reduces decoder depth and parameters substantially while maintaining competitive accuracy under a reduced compute budget.",
    "Efficient Localization and Spatial Distribution Modeling of Canopy Palms Using UAV Imagery": "Understanding the spatial distribution of palms in tropical forests is essential for ecological monitoring, conservation strategies, and the sustainable integration of natural forest products into local and global supply chains. However, the analysis of remotely sensed data are challenged by overlapping palm and tree crowns, uneven shading across the canopy surface, and the heterogeneous nature of the forest landscapes, which often affect the performance of palm detection and segmentation algorithms. To overcome these issues, we introduce PalmDSNet, a deep learning framework for efficient detection, segmentation, and counting of canopy palms. To model spatial patterns, we introduce a bimodal reproduction algorithm that simulates palm propagation based on PalmDSNet outputs. We used UAV-captured imagery to create orthomosaics from 21 sites across western Ecuadorian tropical forests, covering a gradient from the everwet Choco forests near Colombia to the drier forests of southwestern Ecuador. Expert annotations were used to create a comprehensive dataset, including 7,356 bounding boxes on image patches and 7,603 palm centers across five orthomosaics, encompassing a total area of 449 hectares. By integrating detection and spatial modeling, we effectively simulate the spatial distribution of palms in diverse and dense tropical environments, validating its utility for advanced applications in tropical forest monitoring and remote sensing analysis. The dataset can be accessed at 10.5281/zenodo.13822508, and the code to replicate the study is available at github.com/ckn3/palm-ds-sp.",
    "Superpixel-based and Spatially-regularized Diffusion Learning for Unsupervised Hyperspectral Image Clustering": "Hyperspectral images (HSIs) provide exceptional spatial and spectral resolution of a scene, crucial for various remote sensing applications. However, the high dimensionality, presence of noise and outliers, and the need for precise labels of HSIs present significant challenges to the analysis of HSIs, motivating the development of performant HSI clustering algorithms. This paper introduces a novel unsupervised HSI clustering algorithm, Superpixel-based and Spatially-regularized Diffusion Learning (S2DL), which addresses these challenges by incorporating rich spatial information encoded in HSIs into diffusion geometry-based clustering. S2DL employs the Entropy Rate Superpixel (ERS) segmentation technique to partition an image into superpixels, then constructs a spatially-regularized diffusion graph using the most representative high-density pixels. This approach reduces computational burden while preserving accuracy. Cluster modes, serving as exemplars for underlying cluster structure, are identified as the highest-density pixels farthest in diffusion distance from other highest-density pixels. These modes guide the labeling of the remaining representative pixels from ERS superpixels. Finally, majority voting is applied to the labels assigned within each superpixel to propagate labels to the rest of the image. This spatial-spectral approach simultaneously simplifies graph construction, reduces computational cost, and improves clustering performance. S2DL’s performance is illustrated with extensive experiments on four publicly available, real-world HSIs: Indian Pines, Salinas, Salinas A, and WHU-Hi. Additionally, we apply S2DL to landscape-scale, unsupervised mangrove species mapping in the Mai Po Nature Reserve, Hong Kong, using a Gaofen-5 HSI. The success of S2DL in these diverse numerical experiments indicates its efficacy on a wide range of important unsupervised remote sensing analysis tasks.",
    "Unsupervised Diffusion and Volume Maximization-Based Clustering of Hyperspectral Images": "Hyperspectral images taken from aircraft or satellites contain information from hundreds of spectral bands, within which lie latent lower-dimensional structures that can be exploited for classifying vegetation and other materials. A disadvantage of working with hyperspectral images is that, due to an inherent trade-off between spectral and spatial resolution, they have a relatively coarse spatial scale, meaning that single pixels may correspond to spatial regions containing multiple materials. This article introduces the Diffusion and Volume maximization-based Image Clustering (D-VIC) algorithm for unsupervised material clustering to address this problem. By directly incorporating pixel purity into its labeling procedure, D-VIC gives greater weight to pixels corresponding to a spatial region containing just a single material. D-VIC is shown to outperform comparable state-of-the-art methods in extensive experiments on a range of hyperspectral images, including land-use maps and highly mixed forest health surveys (in the context of ash dieback disease), implying that it is well-equipped for unsupervised material clustering of spectrally-mixed hyperspectral datasets.",
    "Change Detection of Amazonian Alluvial Gold Mining Using Deep Learning and Sentinel-2 Imagery": "Monitoring changes within the land surface and open water bodies is critical for natural resource management, conservation, and environmental policy. While the use of satellite imagery for these purposes is common, fine-scale change detection can be a technical challenge. Difficulties arise from variable atmospheric conditions and the problem of assigning pixels to individual objects. We examined the degree to which two machine learning approaches can better characterize change detection in the context of artisanal small-scale gold mining (ASGM). We obtained Sentinel-2 imagery and consulted with domain experts to construct an open-source labeled land-cover change dataset focused on the Madre de Dios region in Peru, a hotspot of ASGM activity, and also generated out-of-sample datasets from other countries. With these labeled data, we utilized supervised and semi-supervised approaches to study binary and multi-class change within mining ponds. We also tested how multiple channels, histogram matching, and La*b* color metrics improved performance and reduced atmospheric effects. Empirical results show that the supervised E-ReCNN method on 6-channel histogram-matched images generated the most accurate change detection both in the focal region and in out-of-sample regions, indicating strong scalability to other forms of land-use modification.",
    "Latent Motion Profiling for Annotation-free Cardiac Phase Detection in Adult and Fetal Echocardiography Videos": "The identification of cardiac phase is an essential step for analysis and diagnosis of cardiac function. Automatic methods, especially data-driven methods for cardiac phase detection, typically require extensive annotations, which is time-consuming and labour-intensive. In this paper, we present an unsupervised framework for end-diastole (ED) and end-systole (ES) detection through self-supervised learning of latent cardiac motion trajectories from 4-chamber-view echocardiography videos. Our method eliminates the need for manual annotations, including ED and ES indices, segmentation, or volumetric measurements, by training a reconstruction model to encode interpretable spatiotemporal motion patterns. Evaluated on the EchoNet-Dynamic benchmark, the approach achieves mean absolute error (MAE) of 3.0 frames (58.3 ms) for ED and 2.0 frames (38.8 ms) for ES detection, matching state-of-the-art supervised methods. Extended to fetal echocardiography, the model demonstrates robust performance with MAE 1.5 frames (20.7 ms) for ED and 1.7 frames (25.3 ms) for ES, despite the fact that the fetal heart model is built using non-standardized heart views due to fetal heart positioning variability. Our results demonstrate the potential of the proposed latent motion trajectory strategy for cardiac phase detection in adult and fetal echocardiography. This work advances unsupervised cardiac motion analysis, offering a scalable solution for clinical populations lacking annotated data. Code is released at https://github.com/YingyuYyy/CardiacPhase.",
    "Blind Restoration of High-Resolution Ultrasound Video": "Ultrasound imaging is widely applied in clinical practice, yet ultrasound videos often suffer from low signal-to-noise ratios (SNR) and limited resolutions, posing challenges for diagnosis and analysis. Variations in equipment and acquisition settings can further exacerbate differences in data distribution and noise levels, reducing the generalizability of pre-trained models. This work presents a self-supervised ultrasound video super-resolution algorithm called Deep Ultrasound Prior (DUP). DUP employs a video-adaptive optimization process of a neural network that enhances the resolution of given ultrasound videos without requiring paired training data while simultaneously removing noise. Quantitative and visual evaluations demonstrate that DUP outperforms existing super-resolution algorithms, leading to substantial improvements for downstream applications.",
    "Detection and Geographic Localization of Natural Objects in the Wild: A Case Study on Palms": "Palms are ecologically and economically indicators of tropical forest health, biodiversity, and human impact that support local economies and global forest product supply chains. While palm detection in plantations is well-studied, efforts to map naturally occurring palms in dense forests remain limited by overlapping crowns, uneven shading, and heterogeneous landscapes. We develop PRISM (Processing, Inference, Segmentation, and Mapping), a flexible pipeline for detecting and localizing palms in dense tropical forests using large orthomosaic images. Orthomosaics are created from thousands of aerial images and spanning several to hundreds of gigabytes. Our contributions are threefold. First, we construct a large UAV-derived orthomosaic dataset collected across 21 ecologically diverse sites in western Ecuador, annotated with 8,830 bounding boxes and 5,026 palm center points. Second, we evaluate multiple state-of-the-art object detectors based on efficiency and performance, integrating zero-shot SAM 2 as the segmentation backbone, and refining the results for precise geographic mapping. Third, we apply calibration methods to align confidence scores with IoU and explore saliency maps for feature explainability. Though optimized for palms, PRISM is adaptable for identifying other natural objects, such as eastern white pines. Future work will explore transfer learning for lower-resolution datasets (0.5–1m). Data and code can be found at github.com/Zippppo/PRISM.",
    "Bilateral Signal Warping for Left Ventricular Hypertrophy Diagnosis": "Left Ventricular Hypertrophy (LVH) is a major cardiovascular risk factor, linked to heart failure, arrhythmia, and sudden cardiac death, often resulting from chronic stress like hypertension. Electrocardiography (ECG), while varying in sensitivity, is widely accessible and cost-effective for detecting LVH-related morphological changes. This work introduces a bilateral signal warping (BSW) approach to improve ECG-based LVH diagnosis. Our method creates a library of heartbeat prototypes from patients with consistent ECG patterns. After preprocessing to eliminate baseline wander and detect R peaks, we apply BSW to cluster heartbeats, generating prototypes for both normal and LVH classes. We compare each new record to these references to support diagnosis. Experimental results show promising potential for practical application in clinical settings.",
    "Optimized Hard Exudate Detection with Supervised Contrastive Learning": "Diabetic retinopathy (DR) is a leading global cause of blindness. Early detection of hard exudates plays a crucial role in identifying DR, which aids in treating diabetes and preventing vision loss. However, the unique characteristics of hard exudates, ranging from their inconsistent shapes to indistinct boundaries, pose significant challenges to existing segmentation techniques. To address these issues, we present a novel supervised contrastive learning framework to optimize hard exudate segmentation. Specifically, we introduce a patch-wise density contrasting scheme to distinguish between areas with varying lesion concentrations, and therefore improve the model’s proficiency in segmenting small lesions. To handle the ambiguous boundaries, we develop a discriminative edge inspection module to dynamically analyze the pixels that lie around the boundaries and accurately delineate the exudates. Upon evaluation using the IDRiD dataset and comparison with state-of-the-art frameworks, our method exhibits its effectiveness and shows potential for computer-assisted hard exudate detection. The code to replicate experiments is available at github.com/wetang7/HECL/.",
    "Unsupervised Spatial-spectral Hyperspectral Image Reconstruction and Clustering with Diffusion Geometry": "Hyperspectral images, which store a hundred or more spectral bands of reflectance, have become an important data source in natural and social sciences. They are often generated in large quantities at a relatively coarse spatial resolution, motivating unsupervised machine learning algorithms that incorporate known structure in hyperspectral imagery. This work introduces the Spatial-Spectral Image Reconstruction and Clustering with Diffusion Geometry (DSIRC) algorithm for partitioning highly mixed hyperspectral images. DSIRC reduces measurement noise through a shape-adaptive reconstruction procedure that uses spectrally correlated pixels within a data-adaptive spatial neighborhood. It then locates high-density, high-purity pixels that are far in diffusion distance from one another and treats these as cluster exemplars. Non-modal pixels are assigned labels through diffusion-distance nearest-neighbor propagation. Strong numerical results indicate that incorporating spatial information through image reconstruction substantially improves pixel-wise clustering performance."
  },
  "selected": {
    "journals": [
      {
        "id": "paper-centerseg",
        "kind": "journal",
        "highlight": null,
        "image": {
          "src": "figures/publications/zhang2026center.webp",
          "width": 640,
          "height": 480,
          "alt": "Figure for CenterSeg"
        },
        "title": "Center-guided Classifier for Semantic Segmentation of Remote Sensing Images",
        "venue": "[TGRS'26]",
        "authorsHtml": "Wei Zhang, Qin Huang, Mengting Ma, Yizhen Jiang, Yun Chen, Zhenhua Huang, Wangyu Wu, <span class=\"main-author\">Kangning Cui</span>, Rongrong Lian, Zhenkai Wu, and Xiaowen Ma<sup>*</sup>",
        "badges": [
          {
            "label": "Paper",
            "href": "https://ieeexplore.ieee.org/document/11364332"
          },
          {
            "label": "Preprint",
            "href": "https://arxiv.org/abs/2503.16963"
          },
          {
            "label": "Code",
            "href": "https://github.com/xwmaxwma/rssegmentation"
          }
        ]
      },
      {
        "id": "paper-palms-tgrs",
        "kind": "journal",
        "highlight": "primary",
        "image": {
          "src": "figures/publications/cui2025efficient.webp",
          "width": 640,
          "height": 480,
          "alt": "Figure for Cui et al., 2025"
        },
        "title": "Efficient Localization and Spatial Distribution Modeling of Canopy Palms Using UAV Imagery",
        "venue": "[TGRS'25]",
        "authorsHtml": "<span class=\"main-author\">Kangning Cui</span><sup>†,*</sup>, Wei Tang<sup>†</sup>, Rongkun Zhu, Manqi Wang, Gregory D. Larsen, Victor P. Pauca, Sarra Alqahtani, Fan Yang, David Segurado, Paul Fine, Jordan Karubian, Raymond H. Chan, Robert J. Plemmons, Jean-Michel Morel, and Miles R. Silman",
        "badges": [
          {
            "label": "Paper",
            "href": "https://ieeexplore.ieee.org/document/11059236"
          },
          {
            "label": "Preprint",
            "href": "https://arxiv.org/abs/2410.11124"
          },
          {
            "label": "Dataset",
            "href": "https://zenodo.org/records/13822508"
          },
          {
            "label": "Code",
            "href": "https://github.com/ckn3/palm-ds-sp"
          }
        ]
      },
      {
        "id": "paper-s2dl",
        "kind": "journal",
        "highlight": "primary",
        "image": {
          "src": "figures/publications/cui2024superpixel.webp",
          "width": 640,
          "height": 480,
          "alt": "Figure for Cui et al., 2023"
        },
        "title": "Superpixel-based and Spatially-regularized Diffusion Learning for Unsupervised Hyperspectral Image Clustering",
        "venue": "[TGRS'24]",
        "authorsHtml": "<span class=\"main-author\">Kangning Cui</span><sup>†,*</sup>, Ruoning Li, Sam L. Polk, Yinyi Lin, Hongsheng Zhang, James M. Murphy, Robert J. Plemmons, and Raymond H. Chan",
        "badges": [
          {
            "label": "Paper",
            "href": "https://ieeexplore.ieee.org/document/10491382"
          },
          {
            "label": "Preprint",
            "href": "https://arxiv.org/abs/2312.15447"
          },
          {
            "label": "Code",
            "href": "https://github.com/ckn3/S2DL"
          }
        ]
      },
      {
        "id": "paper-dvic",
        "kind": "journal",
        "highlight": null,
        "image": {
          "src": "figures/publications/polk2023unsupervised.webp",
          "width": 640,
          "height": 480,
          "alt": "Figure for Polk et al., 2023"
        },
        "title": "Unsupervised Diffusion and Volume Maximization-Based Clustering of Hyperspectral Images",
        "venue": "[RS'23]",
        "authorsHtml": "Sam L. Polk, <span class=\"main-author\">Kangning Cui</span>, Aland H. Y. Chan, David A. Coomes, Robert J. Plemmons, and James M. Murphy<sup>*</sup>",
        "badges": [
          {
            "label": "Paper",
            "href": "https://www.mdpi.com/2072-4292/15/4/1053"
          },
          {
            "label": "Preprint",
            "href": "https://arxiv.org/abs/2203.09992"
          },
          {
            "label": "Code",
            "href": "https://github.com/sampolk/D-VIC"
          }
        ]
      }
    ],
    "conferences": [
      {
        "id": "paper-decodeshare-icml",
        "kind": "conference",
        "highlight": "collaborative",
        "image": {
          "src": "figures/publications/decodeshare_pipeline.webp",
          "width": 1500,
          "height": 324,
          "alt": "Figure for DecodeShare"
        },
        "title": "DecodeShare: Tracing the Shared Subspace of LLM Decode-Time Decisions",
        "venue": "[ICML'26, Spotlight]",
        "authorsHtml": "Zishan Shao, Lixun Zhang, <span class=\"main-author\">Kangning Cui</span>, Yixiao Wang, Ting Jiang, Hancheng Ye, Qinsi Wang, Zhixu Du, Yuzhe Fu, Fan Yang, Danyang Zhuo, Yiran Chen, and Hai Helen Li",
        "badges": [
          {
            "label": "Top 2.2%"
          },
          {
            "label": "Paper",
            "href": "https://icml.cc/virtual/2026/poster/61072"
          },
          {
            "label": "Project Page",
            "href": "https://zishan-shao.github.io/decodeshare/"
          }
        ]
      },
      {
        "id": "paper-help-icmr",
        "kind": "conference",
        "highlight": null,
        "image": {
          "src": "figures/publications/zeng2026icmr.webp",
          "width": 640,
          "height": 480,
          "alt": "Figure for Learning Where to Embed"
        },
        "title": "Learning Where to Embed: Noise-Aware Positional Embedding for Query Retrieval in Small-Object Detection",
        "venue": "[ICMR'26]",
        "authorsHtml": "Yangchen Zeng<sup>†</sup>, Zhenyu Yu<sup>†</sup>, Dongming Jiang, Wenbo Zhang, Yifan Hong, Zhanhua Hu, Jiao Luo, and <span class=\"main-author\">Kangning Cui</span><sup>*</sup>",
        "badges": [
          {
            "label": "Paper",
            "href": "https://dl.acm.org/doi/10.1145/3805622.3810593"
          },
          {
            "label": "Preprint",
            "href": "https://arxiv.org/abs/2604.15065"
          },
          {
            "label": "Code",
            "href": "https://github.com/yidimopozhibai/Noise-Suppressed-Query-Retrieval"
          }
        ]
      },
      {
        "id": "paper-cardiac-phase",
        "kind": "conference",
        "highlight": "collaborative",
        "image": {
          "src": "figures/publications/yang2025miccai.webp",
          "width": 640,
          "height": 480,
          "alt": "Figure for Yang et al., 2025"
        },
        "title": "Latent Motion Profiling for Annotation-free Cardiac Phase Detection in Adult and Fetal Echocardiography Videos",
        "venue": "[MICCAI'25, Oral]",
        "authorsHtml": "Yingyu Yang, Qianye Yang, <span class=\"main-author\">Kangning Cui</span>, Can Peng, Elena D'Alberti, Netzahualcoyotl Hernandez-Cruz, Olga Patey, Aris Papageorghiou, and Alison Noble",
        "badges": [
          {
            "label": "Top 2.1%"
          },
          {
            "label": "Paper",
            "href": "https://link.springer.com/chapter/10.1007/978-3-032-05185-1_31"
          },
          {
            "label": "Preprint",
            "href": "https://arxiv.org/abs/2507.05154"
          },
          {
            "label": "Code",
            "href": "https://github.com/YingyuYyy/CardiacPhase"
          }
        ]
      },
      {
        "id": "paper-palms-ijcai",
        "kind": "conference",
        "highlight": "primary",
        "image": {
          "src": "figures/publications/cui2025ijcai.webp",
          "width": 640,
          "height": 480,
          "alt": "Figure for Cui et al., 2025"
        },
        "title": "Detection and Geographic Localization of Natural Objects in the Wild: A Case Study on Palms",
        "venue": "[IJCAI'25, Oral]",
        "authorsHtml": "<span class=\"main-author\">Kangning Cui</span><sup>†,*</sup>, Rongkun Zhu<sup>†</sup>, Manqi Wang, Wei Tang, Gregory D. Larsen, Victor P. Pauca, Sarra Alqahtani, Fan Yang, David Segurado, David Lutz, Jean-Michel Morel, and Miles R. Silman",
        "badges": [
          {
            "label": "Paper",
            "href": "https://www.ijcai.org/proceedings/2025/1067"
          },
          {
            "label": "Preprint",
            "href": "https://arxiv.org/abs/2502.13023"
          },
          {
            "label": "Poster",
            "href": "docs/posters/cui2025ijcai.pdf"
          },
          {
            "label": "Slides",
            "href": "docs/slides/cui2025ijcai.pdf"
          },
          {
            "label": "Code",
            "href": "https://github.com/Zippppo/PRISM"
          }
        ]
      },
      {
        "id": "paper-lvh",
        "kind": "conference",
        "highlight": null,
        "image": {
          "src": "figures/publications/tang2025isbi.webp",
          "width": 640,
          "height": 480,
          "alt": "Figure for Tang et al., 2025"
        },
        "title": "Bilateral Signal Warping for Left Ventricular Hypertrophy Diagnosis",
        "venue": "[ISBI'25, Oral]",
        "authorsHtml": "Wei Tang<sup>†</sup>, <span class=\"main-author\">Kangning Cui</span><sup>†</sup>, Raymond H. Chan, and Jean-Michel Morel<sup>*</sup>",
        "badges": [
          {
            "label": "Paper",
            "href": "https://ieeexplore.ieee.org/document/10980912"
          },
          {
            "label": "Preprint",
            "href": "https://arxiv.org/abs/2411.08819v1"
          }
        ]
      }
    ]
  }
};
