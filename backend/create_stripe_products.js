const Stripe = require('stripe');
require('dotenv').config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_tu_clave_aqui');

async function createProducts() {
  try {
    console.log('Creando Producto 1: Plan Autónomo...');
    const prodAutonomo = await stripe.products.create({
      name: 'Plan Autónomo',
      description: 'Para cristaleros independientes. Gestiona hasta 40 clientes con 1 cristalero y 1 ruta diaria.',
      metadata: {
        plan_id: 'autonomo',
        max_clientes: '40',
        max_cristaleros: '1',
        max_rutas_dia: '1',
        frecuencias: 'todas',
        facturacion_auto: 'true',
        dashboard: 'true',
        email_factura: 'true'
      }
    });

    const priceAutonomo = await stripe.prices.create({
      product: prodAutonomo.id,
      unit_amount: 2900, // 29.00 EUR
      currency: 'eur',
      recurring: { interval: 'month' },
      tax_behavior: 'exclusive',
    });
    console.log(`✓ Plan Autónomo creado. Producto ID: ${prodAutonomo.id}, Precio ID: ${priceAutonomo.id}`);

    console.log('\nCreando Producto 2: Plan Pro...');
    const prodPro = await stripe.products.create({
      name: 'Plan Pro',
      description: 'Para pequeñas empresas. Gestiona hasta 150 clientes con 5 cristaleros y 5 rutas diarias.',
      metadata: {
        plan_id: 'pro',
        max_clientes: '150',
        max_cristaleros: '5',
        max_rutas_dia: '5',
        frecuencias: 'todas',
        facturacion_auto: 'true',
        dashboard: 'true',
        email_factura: 'true'
      }
    });

    const pricePro = await stripe.prices.create({
      product: prodPro.id,
      unit_amount: 4900, // 49.00 EUR
      currency: 'eur',
      recurring: { interval: 'month' },
      tax_behavior: 'exclusive',
    });
    console.log(`✓ Plan Pro creado. Producto ID: ${prodPro.id}, Precio ID: ${pricePro.id}`);

    console.log('\n¡Proceso completado! Por favor, copia los Precios ID para usarlos en el frontend.');
  } catch (err) {
    console.error('Error al crear productos en Stripe:', err.message);
  }
}

createProducts();
