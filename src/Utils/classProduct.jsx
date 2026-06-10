import { makeId } from './makeId'
import { PRODUCTS } from './constList';

class Producto {
  constructor({
    name,
    id,
    price,
    modifique = [],
    type,
    colorPrimary,
    colorSecondary,
    code,
    applyModifications = true,
  }) {
    this.name = name
    this.id = id
    this.price = price
    this.modifique = modifique
    this.type = type
    this.idInter = makeId(5)
    this.colorPrimary = colorPrimary
    this.colorSecondary = colorSecondary
    code ? this.code = code : null
    this.applyModifications = applyModifications
  }
  anadirModifique(modifique) {
    this.modifique.push(modifique)
  }
  retirarModifique({ name, index, id, idInter }) {
    let indexProducto
    if (name !== undefined) {
      indexProducto = this.modifique.findIndex(producto => producto.name == name)
    }
    if (id !== undefined) {
      indexProducto = this.modifique.findIndex(producto => producto.id == id)
    }
    if (index !== undefined) {
      indexProducto = index
    }
    if (idInter !== undefined) {
      indexProducto = this.modifique.findIndex(producto => producto.idInter == idInter)
    }
    if (indexProducto <= -1) throw `no se encontro ningun prouduc que cumple con las condiciones de busqueda`
    this.modifique.splice(indexProducto, 1)
  }
}

class Adiciones {
  constructor({
    name = 'sin nombre',
    id = null,
    price = 0,
    colorPrimary = '#045701',
    colorSecondary = '#050158',
    code = null,
    description = '',
    idCodigo = null,
    imagen = null,
    type = 'complement',

  }) {
    this.name = name
    this.id = id
    this.price = price
    this.colorPrimary = colorPrimary || '#045701'
    this.colorSecondary = colorSecondary || '#050158'
    this.idInter = makeId(5)
    code ? this.code = code : null
    this.description = description
    idCodigo ? this.idCodigo = idCodigo : null
    this.imagen = imagen
    this.type = type
  }
}

class Hamburguesa extends Producto {
  constructor(props) {
    super(props)
    this.name = PRODUCTS.Hamburguesa
    this.id = `2`
    this.type = 'product'
    this.price = 23900
  }
}
class Combo extends Producto {
  constructor(props) {
    super(props)
    this.name = PRODUCTS.Combo
    this.id = `1`
    this.type = 'product'
    this.price = 28900
  }
}

class SalsaDeAjo extends Producto {
  constructor(props) {
    super({ ...props, applyModifications: true })
    this.name = PRODUCTS.SalsaDeAjo
    this.id = `38`
    this.type = `product`
    this.price = 27000
  }
}

class PapasVaquera extends Producto {
  constructor(props) {
    super({ ...props, applyModifications: true })
    this.name = PRODUCTS.PapaVaquera
    this.id = `39`
    this.type = 'product'
    this.price = 23900
  }
}

class PapasTroyana extends Producto {
  constructor(props) {
    super({ ...props, applyModifications: true })
    this.name = PRODUCTS.PapaTroyana
    this.id = `40`
    this.type = 'product'
    this.price = 33900
  }
}

//postre chessecake de fresa id 43
class CheesecakeFresa extends Producto {
  constructor(props) {
    super({ ...props, applyModifications: true })
    this.name = PRODUCTS.CheesecakeFresa
    this.id = `43`
    this.type = 'product'
    this.price = 14000
  }
}

//jugo de mora id 44
class JugoMora extends Producto {
  constructor(props) {
    super({ ...props, applyModifications: true })
    this.name = PRODUCTS.JugoMora
    this.id = `44`
    this.type = 'product'
    this.price = 7000
  }
}

export {
  Producto,
  Hamburguesa,
  Combo,
  SalsaDeAjo,
  PapasVaquera,
  PapasTroyana,
  Adiciones,
  CheesecakeFresa,
  JugoMora,
}