type IntrinsicDimensions = readonly [width: number, height: number];

// Intrinsic dimensions measured from the corresponding local image assets.
// CSS still controls the rendered crop and size; these values reserve the
// image's natural aspect ratio before it loads.
const DIMENSIONS_BY_FILENAME: Readonly<Record<string, IntrinsicDimensions>> = {
  "T1_1783175639406-C8-P_19F.webp": [1536, 1024],
  "image_1780437854819-CKpOqA13.png": [730, 114],
  "image_1780532431289-DjFszPgZ.png": [223, 171],
  "envod-logo-badge.webp": [223, 171],
  "envod-logo-badge-146.webp": [146, 112],
  "jctrans-256.webp": [256, 68],
  "image_1783126483702-SeVldUOC.png": [727, 198],
  "image_1783126624254-BGbptc9f.png": [1583, 432],
  "image_1783126648923-BLCJeBKQ.png": [423, 283],
  "image_1783126675624-D1OdCbqZ.png": [659, 303],
  "image_1783126714478-CPlH5gri.png": [600, 371],
  "image_1783126737093-CgQzyfVm.png": [600, 321],
  "image_1783126766781-hF7NdyOC.png": [600, 326],
  "image_1783126783660-BRXaLr1u.png": [406, 264],
  "image_1783126803493-D-lGp1F4.png": [370, 228],
  "image_1783126855621-Dwczm5x5.png": [600, 359],
  "image_1783126930810-esgzQi8U.png": [275, 183],
  "image_1783126985787-8UIZjGQr.png": [565, 353],
  "image_1783173229953-CSw6I9Br.webp": [1536, 1024],
  "door_to_door_delivery_1792676608888.webp": [1600, 900],
  "door-to-door-delivery.webp": [1600, 900],
  "image_1783173712084-DqQQc23B.webp": [1536, 1024],
  "image_1783174016086-CJ3t7gLT.webp": [1536, 1024],
  "image_1783174152080-D9GvARqV.webp": [1536, 1024],
  "image_1783175444439-D6-_ISKq.webp": [1536, 1024],
  "image_1783175451933-t3k0z13v.webp": [1536, 1024],
  "image_1783175755090-CF38X8xv.webp": [1536, 1024],
  "image_1783175872287-D-58iny4.webp": [1536, 1024],
  "image_1783176090687-Dlmgi-pd.webp": [1402, 1122],
  "image_1783176354422-ByHGIRox.webp": [1566, 1004],
  "image_1783176444016-iNoU1SEb.webp": [1536, 1024],
  "image_1783195652393-CMfKC6SN.webp": [1536, 1024],
  "image_1783195818421-5T3hO8cW.webp": [1536, 1024],
  "image_1783197074233-B7uoYghs.webp": [1600, 900],
  "image_1783197631734-DE170Upl.webp": [1536, 1024],
  "image_1783197745221-Bua2vc9V.webp": [1492, 1054],
  "image_1783198399466-B6CSfF3b.webp": [1536, 1024],
  "image_1783198657064-DW7ye0ys.webp": [1600, 957],
  "ind_aerospace-3p32Uk9r.webp": [800, 533],
  "ind_automotive-Dw2TLxYg.webp": [800, 539],
  "ind_chemical-B1uaI3G2.webp": [800, 533],
  "ind_construction-dSTE6hvI.webp": [800, 533],
  "ind_electronics-DcrRS1zp.webp": [800, 544],
  "ind_fashion-XZcYL19K.webp": [800, 534],
  "ind_furniture-BO4NiKae.webp": [800, 534],
  "ind_government-BJCi575n.webp": [800, 479],
  "ind_hospitality-BF_vAt-b.webp": [800, 600],
  "ind_retail-hZCNrfjE.webp": [800, 533],
  "ind_telecom-B0Gi1AXd.webp": [800, 533],
  "logo_aaf-CmcKWDWO.webp": [480, 248],
  "logo_alredwan-BWluhA9G.webp": [398, 119],
  "logo_aramco-DP5_6fN_.webp": [480, 146],
  "logo_asiacup-DBEi592a.webp": [600, 280],
  "logo_ath-7qBknATX.webp": [480, 268],
  "logo_bmtc-Da0lU6Wg.webp": [480, 400],
  "logo_cityflower-Dsik5MIQ.webp": [357, 124],
  "logo_golfsaudi-CKwoBlDE.webp": [218, 167],
  "logo_kaprel-CubmGFDP.webp": [600, 219],
  "logo_katerra-Cb5pOzb9.webp": [480, 271],
  "logo_mobily-C7ewRrzE.webp": [410, 166],
  "logo_mss-NY64V85b.webp": [220, 138],
  "logo_olayan-fgqocig3.webp": [480, 101],
  "logo_porsche-C5j78nSG.webp": [316, 173],
  "logo_sitco-CX_dQrWm.webp": [600, 481],
  "logo_stc-DdMTsOpD.webp": [480, 254],
  "logo_vision2030-BzIwp4ml.webp": [640, 436],
  "logo_watania-OSY_Y_um.webp": [179, 146],
  "service_courier_1783201004-DR4t7iEU.webp": [1408, 768],
  "service_cross_trade_1783201005-60fzraw0.webp": [1408, 768],
  "service_packaging_1783201003-DbNqgolp.webp": [1408, 768],
  "service_temp_controlled_1783201002-DmyVj5wm.webp": [1408, 768],
  "service_white_glove_1783201001-Clb2ikLY.webp": [1408, 768],
};

export function getIntrinsicImageDimensions(
  src: string | undefined,
): { width?: number; height?: number } {
  if (!src || src.startsWith("data:")) return {};
  const pathname = src.split(/[?#]/, 1)[0];
  const filename = pathname.slice(pathname.lastIndexOf("/") + 1);
  const dimensions =
    DIMENSIONS_BY_FILENAME[filename] ??
    (filename.startsWith("door_to_door_delivery_1792676608888-") ? [1600, 900] as const : undefined);
  return dimensions ? { width: dimensions[0], height: dimensions[1] } : {};
}
