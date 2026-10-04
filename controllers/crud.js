const { h, ok, fail } = require('../utils/helpers');
module.exports = (Model, o = {}) => {
  const denied = async (d, req) => o.ownerOf && req.user.role !== 'admin' && String(await o.ownerOf(d)) !== String(req.user._id);
  return {
    list: h(async (req, res) => ok(res, await Model.find(o.filter ? await o.filter(req) : {}).populate(o.populate || '').sort('-createdAt'))),
    get: h(async (req, res) => { const d = await Model.findById(req.params.id).populate(o.populate || ''); return d ? ok(res, d) : fail(res, 404, 'Not found'); }),
    create: h(async (req, res) => ok(res, await Model.create(o.prepare ? await o.prepare(req) : req.body), 201)),
    update: h(async (req, res) => {
      const d = await Model.findById(req.params.id); if (!d) return fail(res, 404, 'Not found');
      if (await denied(d, req)) return fail(res, 403, 'Not your resource');
      const b = { ...req.body }; (o.protectedFields || []).forEach(f => delete b[f]);
      d.set(b); await d.save(); ok(res, d);
    }),
    remove: h(async (req, res) => {
      const d = await Model.findById(req.params.id); if (!d) return fail(res, 404, 'Not found');
      if (await denied(d, req)) return fail(res, 403, 'Not your resource');
      await d.deleteOne(); ok(res, { id: req.params.id, deleted: true });
    }),
  };
};
