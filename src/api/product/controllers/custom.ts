const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::product.product', ({ strapi }) => ({
  async custom(ctx) {
    const {
      type,
      location,
      funeral_location,
      price,
      guests,
      funeral_type,
      payment,
      arrangements,
      facilities,
      transport,
      coffin,
      headstone_monuments,
      code
    } = ctx.query;

    // Prepare dynamic filters with initial values (placeholders)
    const filters = {
      ...(type && { type }),
      ...(location && { location }),
      ...(funeral_type && { funeral_type }),
      ...(payment && { payment }),
      ...(arrangements && { arrangements }),
      ...(guests && { guests }),
      ...(funeral_location && { funeral_location }),
      ...(facilities && { facilities }),
      ...(transport && { transport }),
      ...(coffin && { coffin }),
      ...(headstone_monuments && { headstone_monuments }),
      ...(price && { price }),
      ...(code && { code }),
    };
    // Handle price range filter using BigInt comparison
    if (price) {
      const [minPrice, maxPrice] = price.split('-').map((value) => BigInt(value));
      filters.price = {
        ...(minPrice ? { $gte: minPrice } : {}),
        ...(maxPrice ? { $lte: maxPrice } : {}),
      };
    }

    // Handle guests filter using BigInt comparison
    if (guests) {
      if (guests === '<50') {
        filters.guests = { $lt: BigInt(50) };
      } else if (guests === '50-100') {
        filters.guests = { $gte: BigInt(50), $lte: BigInt(100) };
      } else if (guests === '>150') {
        filters.guests = { $gt: BigInt(150) };
      }
    }

    // Add other filters if provided
    if (funeral_type) filters.funeral_type = funeral_type;
    if (payment) filters.payment = payment;
    if (arrangements) filters.arrangements = arrangements;
    if (facilities) filters.facilities = { $contains: facilities };
    if (transport) filters.transport = { $contains: transport };
    if (coffin) filters.coffin = { $contains: coffin };
    if (headstone_monuments) filters.headstone_monuments = { $contains: headstone_monuments };
    if (code) filters.code = { $contains: code };

    try {
      const products = await strapi.db.query('api::product.product').findMany({
        where: Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== undefined)),
        select: ['*'],
        populate: ['logo'],
      });
      const uniqueProducts = products.filter((product, index, self) => 
        index === self.findIndex((p) => p.documentId === product.documentId)
      );

      ctx.send(uniqueProducts);
    } catch (error) {
      console.error('Error fetching data:', error);
      ctx.throw(500, 'Unable to fetch data');
    }
  }
}));
