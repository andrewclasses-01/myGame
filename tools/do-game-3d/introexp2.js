(async () => {
  const T = await import('/templates/rocket-race/vendor/three/three.module.min.js');
  const I = __rwI, R = I.renderer, sc = I.scene, sl = ms => new Promise(r => setTimeout(r, ms));
  const o = R.__o || (R.__o = R.setPixelRatio.bind(R)); R.setPixelRatio = () => {}; o(1); I.composer.setPixelRatio(1); I.composer.setSize(I.root.clientWidth, I.root.clientHeight);
  const lights = []; sc.traverse(x => { if (x.isLight) lights.push(x); });
  const rects = lights.filter(l => l.isRectAreaLight), heads = lights.filter(l => l.isSpotLight && !l.castShadow), sun = lights.find(l => l.isDirectionalLight);
  let floor = null; sc.traverse(x => { if (x.isMesh && x.material && x.material.clearcoat > 0) floor = x; });
  const recompile = () => { sc.traverse(x => { if (x.material) (Array.isArray(x.material) ? x.material : [x.material]).forEach(m => m.needsUpdate = true); }); };
  const meas = async lab => { R.shadowMap.needsUpdate = true; await sl(1200); const r = await __gpuT(I.composer, R, 2000, lab); return lab + ' => RP ' + r['0:RenderPass'] + ' ms (total ' + r.total + ')'; };
  const out = [];
  // cấu hình rẻ: 1 rect + không đèn pha + sàn không clearcoat
  rects.slice(1).forEach(l => sc.remove(l)); heads.forEach(l => { l.__p = l.parent; l.parent.remove(l); });
  if (floor) floor.material.clearcoat = 0; recompile();
  out.push(await meas('cheap PCFSoft'));
  R.shadowMap.type = T.PCFShadowMap; recompile(); out.push(await meas('cheap PCF'));
  R.shadowMap.type = T.BasicShadowMap; recompile(); out.push(await meas('cheap Basic'));
  R.shadowMap.type = T.PCFShadowMap; sun.castShadow = false; recompile(); out.push(await meas('cheap PCF no sun shadow'));
  // khôi phục
  sun.castShadow = true; R.shadowMap.type = T.PCFSoftShadowMap; rects.slice(1).forEach(l => sc.add(l)); heads.forEach(l => l.__p.add(l)); if (floor) floor.material.clearcoat = 0.6; recompile();
  R.setPixelRatio = o;
  return out.join('\n');
})()
