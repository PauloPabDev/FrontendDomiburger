/**
 * Enriquece un complemento con datos del catálogo de productos,
 * preservando los valores originales del item (precio, nota, nombre personalizado)
 */
const enrichComplement = (complement, listProducts) => {
  const catalogProduct = listProducts.find((p) => p.id === complement.id);
  if (!catalogProduct) {
    return complement;
  }

  return {
    ...catalogProduct,      // Datos base del catálogo (colorPrimary, imagen, etc.)
    ...complement,          // Valores originales del complemento (sobrescriben el catálogo)
    catalogPrice: catalogProduct?.price,  // Precio del catálogo como referencia
  };
};

/**
 * Enriquece un item de orden con datos del catálogo de productos,
 * preservando los valores originales del item (precio, nota, nombre personalizado)
 */
const enrichOrderItem = (item, listProducts) => {
  const catalogProduct = listProducts.find((p) => p.id === item.id);

  const enrichedComplements = item.complements
    ? item.complements.map((complement) => enrichComplement(complement, listProducts))
    : [];

  if (!catalogProduct) {
    return {
      ...item,
      complements: enrichedComplements,
    };
  }

  return {
    ...catalogProduct,      // Datos base del catálogo (colorPrimary, imagen, etc.)
    ...item,                // Valores originales del item (sobrescriben el catálogo)
    catalogPrice: catalogProduct?.price,  // Precio del catálogo como referencia
    complements: enrichedComplements,
  };
};

/**
 * Agrupa productos por ID y suma sus cantidades
 */
const groupProductsById = (products) => {
  const grouped = new Map();

  for (const item of products) {
    const existing = grouped.get(item.id);

    if (existing) {
      existing.quantity += item.quantity || 1;
    } else {
      grouped.set(item.id, { ...item, quantity: item.quantity || 1 });
    }
  }

  return grouped;
};

/**
 * Genera componentes badge para mostrar el resumen de productos
 */
const ProductBadges = ({ groupedProducts }) => {
  return Array.from(groupedProducts.values()).map((item) => (
    <span
      key={item.id}
      className="badge m-1"
      style={{ backgroundColor: item.colorPrimary }}
    >
      {item.quantity} {item.name}
    </span>
  ));
};

/**
 * Procesa los items de una orden y los enriquece con datos del catálogo
 * Preserva: price, note, name, quantity del item original
 * Agrega: colorPrimary, imagen, y otros datos del catálogo
 */
const ResumedItems = (orderItems, listProducts) => {
  if (!orderItems || !listProducts) {
    return {
      component: null,
      hasComplements: false,
      listResumed: new Map(),
      products: [],
    };
  }

  // Enriquecer cada item con datos del catálogo
  const products = orderItems.map((item) => enrichOrderItem(item, listProducts));

  // Agrupar productos por ID para el resumen
  const listResumed = groupProductsById(products);

  // Verificar si hay complementos
  const hasComplements = products.some((item) => item.complements?.length > 0);

  // Generar componente de badges
  const component = <ProductBadges groupedProducts={listResumed} />;

  return {
    component,
    hasComplements,
    listResumed,
    products,
  };
};

export { ResumedItems, enrichOrderItem, enrichComplement, groupProductsById };
