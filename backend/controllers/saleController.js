const Sale = require('../models/saleModel');
const Product = require('../models/productModel');

// @desc    Create new sale
// @route   POST /api/sales
// @access  Private
const createSale = async (req, res) => {
  try {
    const { productId, quantity, location } = req.body;
    console.log('Datos recibidos:', { productId, quantity, location });

    const product = await Product.findById(productId);
    if (!product) {
      console.log('Producto no encontrado');
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    console.log('Stock actual:', product.stock);

    // Verificar que el producto tenga stock
    if (!product.stock || typeof product.stock.get !== 'function') {
      console.log('Error en formato de stock:', product.stock);
      return res.status(400).json({ message: 'Error en el formato del stock' });
    }

    // Si no se especifica ubicación, usar la primera disponible con stock
    let selectedLocation = location;
    if (!selectedLocation) {
      const locations = Array.from(product.stock.keys());
      selectedLocation = locations.find(loc => (product.stock.get(loc) || 0) > 0);
      if (!selectedLocation) {
        console.log('No hay stock disponible en ninguna ubicación');
        return res.status(400).json({ message: 'No hay stock disponible' });
      }
    }

    const currentStock = product.stock.get(selectedLocation) || 0;
    console.log('Stock en ubicación:', { selectedLocation, currentStock });

    // Verificar stock en la ubicación seleccionada
    if (currentStock < quantity) {
      console.log('Stock insuficiente:', { currentStock, requested: quantity });
      return res.status(400).json({ message: 'Stock insuficiente en la ubicación seleccionada' });
    }

    // Calcular total
    const total = product.price * quantity;

    // Crear venta
    const sale = await Sale.create({
      product: productId,
      quantity,
      total,
    });

    // Actualizar stock
    product.stock.set(selectedLocation, currentStock - quantity);
    await product.save();

    console.log('Venta creada:', sale);
    console.log('Stock actualizado:', product.stock);

    // Devolver la venta con los datos del producto
    const populatedSale = await Sale.findById(sale._id).populate('product', 'name price');
    res.status(201).json(populatedSale);
  } catch (error) {
    console.error('Error en createSale:', error);
    res.status(500).json({ message: 'Error al procesar la venta: ' + error.message });
  }
};

// @desc    Get sales
// @route   GET /api/sales
// @access  Private
const getSales = async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate('product', 'name price')
      .sort({ date: -1 });
    res.json(sales);
  } catch (error) {
    console.error('Error en getSales:', error);
    res.status(500).json({ message: 'Error al obtener las ventas' });
  }
};

module.exports = {
  createSale,
  getSales,
};
