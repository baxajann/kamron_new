import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Начало заполнения базы данных...')

  // Clear existing data
  await prisma.activityLog.deleteMany()
  await prisma.favorite.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.kPIRecord.deleteMany()
  await prisma.visit.deleteMany()
  await prisma.route.deleteMany()
  await prisma.refusal.deleteMany()
  await prisma.return.deleteMany()
  await prisma.debt.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.inventory.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.warehouse.deleteMany()
  await prisma.client.deleteMany()
  await prisma.territory.deleteMany()
  await prisma.clientType.deleteMany()
  await prisma.user.deleteMany()
  await prisma.branch.deleteMany()

  // BRANCHES
  const branches = await Promise.all([
    prisma.branch.create({ data: { name: 'Ташкент', address: 'г. Ташкент, ул. Амира Темура, 45', phone: '+998712001234', manager: 'Рустам Каримов' } }),
    prisma.branch.create({ data: { name: 'Бекобод', address: 'г. Бекобод, ул. Навоий, 12', phone: '+998721002345', manager: 'Фаррух Юсупов' } }),
    prisma.branch.create({ data: { name: 'Янгиюль', address: 'г. Янгиюль, ул. Мустакиллик, 8', phone: '+998701003456', manager: 'Дилноза Рахимова' } }),
    prisma.branch.create({ data: { name: 'Завод', address: 'Ташкентская обл., Промышленная зона', phone: '+998712004567', manager: 'Санжар Абдуллаев' } }),
    prisma.branch.create({ data: { name: 'Хоразм', address: 'г. Ургенч, ул. Аль-Хорезмий, 33', phone: '+998622005678', manager: 'Мадина Тошматова' } }),
  ])

  const [tashkent, bekabad, yangiYul, zavod, khorezm] = branches

  // CLIENT TYPES
  const clientTypes = await Promise.all([
    prisma.clientType.create({ data: { name: 'Розничный магазин' } }),
    prisma.clientType.create({ data: { name: 'Оптовый склад' } }),
    prisma.clientType.create({ data: { name: 'Супермаркет' } }),
    prisma.clientType.create({ data: { name: 'Ресторан / кафе' } }),
    prisma.clientType.create({ data: { name: 'Аптека' } }),
  ])

  // TERRITORIES
  const territories = await Promise.all([
    prisma.territory.create({ data: { name: 'Центральный район', region: 'Ташкент' } }),
    prisma.territory.create({ data: { name: 'Северный район', region: 'Ташкент' } }),
    prisma.territory.create({ data: { name: 'Южный район', region: 'Ташкент' } }),
    prisma.territory.create({ data: { name: 'Бекободский район', region: 'Ташкентская обл.' } }),
    prisma.territory.create({ data: { name: 'Янгиюльский район', region: 'Ташкентская обл.' } }),
    prisma.territory.create({ data: { name: 'Хорезмский район', region: 'Хорезм' } }),
  ])

  // CATEGORIES
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Напитки' } }),
    prisma.category.create({ data: { name: 'Молочная продукция' } }),
    prisma.category.create({ data: { name: 'Кондитерские изделия' } }),
    prisma.category.create({ data: { name: 'Бакалея' } }),
    prisma.category.create({ data: { name: 'Бытовая химия' } }),
    prisma.category.create({ data: { name: 'Снеки и чипсы' } }),
  ])

  // WAREHOUSES
  const warehouses = await Promise.all([
    prisma.warehouse.create({ data: { name: 'Главный склад Ташкент', branchId: tashkent.id, address: 'Ташкент, ул. Чиланзар, 101' } }),
    prisma.warehouse.create({ data: { name: 'Склад Бекобод', branchId: bekabad.id, address: 'Бекобод, ул. Промышленная, 5' } }),
    prisma.warehouse.create({ data: { name: 'Склад Хоразм', branchId: khorezm.id, address: 'Ургенч, ул. Шавкат, 22' } }),
  ])

  // USERS
  const hashedPassword = await bcrypt.hash('Admin123', 10)
  const managerPassword = await bcrypt.hash('Manager123', 10)
  const agentPassword = await bcrypt.hash('Agent123', 10)

  const users = await Promise.all([
    prisma.user.create({ data: { name: 'Александр Петров', email: 'admin@distribcontrol.uz', password: hashedPassword, role: 'ADMIN', branchId: tashkent.id, phone: '+998901234567' } }),
    prisma.user.create({ data: { name: 'Рустам Каримов', email: 'manager@distribcontrol.uz', password: managerPassword, role: 'MANAGER', branchId: tashkent.id, phone: '+998901234568' } }),
    prisma.user.create({ data: { name: 'Алишер Назаров', email: 'agent1@distribcontrol.uz', password: agentPassword, role: 'AGENT', branchId: tashkent.id, phone: '+998901234569' } }),
    prisma.user.create({ data: { name: 'Дилшод Юсупов', email: 'agent2@distribcontrol.uz', password: agentPassword, role: 'AGENT', branchId: bekabad.id, phone: '+998901234570' } }),
    prisma.user.create({ data: { name: 'Санжар Рахимов', email: 'agent3@distribcontrol.uz', password: agentPassword, role: 'AGENT', branchId: yangiYul.id, phone: '+998901234571' } }),
    prisma.user.create({ data: { name: 'Мадина Хасанова', email: 'agent4@distribcontrol.uz', password: agentPassword, role: 'AGENT', branchId: zavod.id, phone: '+998901234572' } }),
    prisma.user.create({ data: { name: 'Бобур Мирзаев', email: 'agent5@distribcontrol.uz', password: agentPassword, role: 'AGENT', branchId: khorezm.id, phone: '+998901234573' } }),
    prisma.user.create({ data: { name: 'Феруза Ахмедова', email: 'finance@distribcontrol.uz', password: managerPassword, role: 'FINANCE', branchId: tashkent.id, phone: '+998901234574' } }),
    prisma.user.create({ data: { name: 'Шохрух Турсунов', email: 'warehouse@distribcontrol.uz', password: managerPassword, role: 'WAREHOUSE', branchId: tashkent.id, phone: '+998901234575' } }),
    prisma.user.create({ data: { name: 'Нилуфар Исмоилова', email: 'manager2@distribcontrol.uz', password: managerPassword, role: 'MANAGER', branchId: bekabad.id, phone: '+998901234576' } }),
    prisma.user.create({ data: { name: 'Отабек Сидиков', email: 'agent6@distribcontrol.uz', password: agentPassword, role: 'AGENT', branchId: tashkent.id, phone: '+998901234577' } }),
    prisma.user.create({ data: { name: 'Зафар Мусаев', email: 'agent7@distribcontrol.uz', password: agentPassword, role: 'AGENT', branchId: khorezm.id, phone: '+998901234578' } }),
  ])

  const [admin, manager, agent1, agent2, agent3, agent4, agent5, finance, warehouse, manager2, agent6, agent7] = users

  // PRODUCTS (30+)
  const productData = [
    { name: 'Coca-Cola 0.5л', sku: 'BEV-001', categoryId: categories[0].id, brand: 'Coca-Cola', price: 4500, unit: 'шт', minStock: 50 },
    { name: 'Pepsi 0.5л', sku: 'BEV-002', categoryId: categories[0].id, brand: 'Pepsi', price: 4200, unit: 'шт', minStock: 50 },
    { name: 'Coca-Cola 1.5л', sku: 'BEV-003', categoryId: categories[0].id, brand: 'Coca-Cola', price: 7500, unit: 'шт', minStock: 30 },
    { name: 'Sprite 0.5л', sku: 'BEV-004', categoryId: categories[0].id, brand: 'Coca-Cola', price: 4500, unit: 'шт', minStock: 30 },
    { name: 'Fanta 0.5л', sku: 'BEV-005', categoryId: categories[0].id, brand: 'Coca-Cola', price: 4500, unit: 'шт', minStock: 30 },
    { name: 'Молоко "Lactel" 1л', sku: 'MILK-001', categoryId: categories[1].id, brand: 'Lactel', price: 12000, unit: 'шт', minStock: 100 },
    { name: 'Кефир "Lactel" 1л', sku: 'MILK-002', categoryId: categories[1].id, brand: 'Lactel', price: 10500, unit: 'шт', minStock: 50 },
    { name: 'Йогурт "Activia" 400г', sku: 'MILK-003', categoryId: categories[1].id, brand: 'Danone', price: 15000, unit: 'шт', minStock: 40 },
    { name: 'Сметана "Lactel" 400г', sku: 'MILK-004', categoryId: categories[1].id, brand: 'Lactel', price: 14000, unit: 'шт', minStock: 30 },
    { name: 'Творог "Lactel" 200г', sku: 'MILK-005', categoryId: categories[1].id, brand: 'Lactel', price: 11000, unit: 'шт', minStock: 25 },
    { name: 'Печенье "Oreo" 176г', sku: 'CONF-001', categoryId: categories[2].id, brand: 'Oreo', price: 9500, unit: 'шт', minStock: 60 },
    { name: 'Шоколад "Milka" 90г', sku: 'CONF-002', categoryId: categories[2].id, brand: 'Milka', price: 18000, unit: 'шт', minStock: 40 },
    { name: 'Конфеты "Рот Фронт" 1кг', sku: 'CONF-003', categoryId: categories[2].id, brand: 'Рот Фронт', price: 45000, unit: 'кг', minStock: 20 },
    { name: 'Вафли "Мишка" 300г', sku: 'CONF-004', categoryId: categories[2].id, brand: 'Местный', price: 12000, unit: 'шт', minStock: 30 },
    { name: 'Торт "Наполеон" 1кг', sku: 'CONF-005', categoryId: categories[2].id, brand: 'Пекарня ТД', price: 65000, unit: 'шт', minStock: 10 },
    { name: 'Рис "Девзира" 5кг', sku: 'GROC-001', categoryId: categories[3].id, brand: 'Местный', price: 55000, unit: 'кг', minStock: 100 },
    { name: 'Масло подсолнечное 1л', sku: 'GROC-002', categoryId: categories[3].id, brand: 'Олейна', price: 22000, unit: 'шт', minStock: 80 },
    { name: 'Сахар 1кг', sku: 'GROC-003', categoryId: categories[3].id, brand: 'Местный', price: 11000, unit: 'кг', minStock: 200 },
    { name: 'Мука пшеничная 2кг', sku: 'GROC-004', categoryId: categories[3].id, brand: 'Местный', price: 14000, unit: 'шт', minStock: 100 },
    { name: 'Соль поваренная 1кг', sku: 'GROC-005', categoryId: categories[3].id, brand: 'Местный', price: 3500, unit: 'кг', minStock: 150 },
    { name: 'Порошок "Tide" 3кг', sku: 'CHEM-001', categoryId: categories[4].id, brand: 'Procter&Gamble', price: 68000, unit: 'шт', minStock: 30 },
    { name: 'Средство "Fairy" 500мл', sku: 'CHEM-002', categoryId: categories[4].id, brand: 'Procter&Gamble', price: 22000, unit: 'шт', minStock: 40 },
    { name: 'Шампунь "Head&Shoulders" 400мл', sku: 'CHEM-003', categoryId: categories[4].id, brand: 'Procter&Gamble', price: 45000, unit: 'шт', minStock: 25 },
    { name: 'Гель "Domestos" 750мл', sku: 'CHEM-004', categoryId: categories[4].id, brand: 'Unilever', price: 28000, unit: 'шт', minStock: 30 },
    { name: 'Чипсы "Lay\'s" 90г', sku: 'SNACK-001', categoryId: categories[5].id, brand: 'PepsiCo', price: 8500, unit: 'шт', minStock: 80 },
    { name: 'Сухарики "Хрустень" 80г', sku: 'SNACK-002', categoryId: categories[5].id, brand: 'Местный', price: 4500, unit: 'шт', minStock: 100 },
    { name: 'Попкорн "Act II" 100г', sku: 'SNACK-003', categoryId: categories[5].id, brand: 'ConAgra', price: 7000, unit: 'шт', minStock: 40 },
    { name: 'Семечки жареные 200г', sku: 'SNACK-004', categoryId: categories[5].id, brand: 'Местный', price: 5500, unit: 'шт', minStock: 60 },
    { name: 'Вода "Nestle" 1.5л', sku: 'BEV-006', categoryId: categories[0].id, brand: 'Nestle', price: 6000, unit: 'шт', minStock: 100 },
    { name: 'Сок "Rich" Апельсин 1л', sku: 'BEV-007', categoryId: categories[0].id, brand: 'Rich', price: 14000, unit: 'шт', minStock: 50 },
    { name: 'Энергетик "Red Bull" 0.25л', sku: 'BEV-008', categoryId: categories[0].id, brand: 'Red Bull', price: 22000, unit: 'шт', minStock: 30 },
  ]

  const products = await Promise.all(productData.map(p => prisma.product.create({ data: p })))

  // INVENTORY
  const inventoryData = []
  for (const product of products) {
    const qty = Math.floor(Math.random() * 500) + 50
    inventoryData.push({ productId: product.id, warehouseId: warehouses[0].id, quantity: qty, reservedQty: Math.floor(qty * 0.1) })
  }
  await Promise.all(inventoryData.map(inv => prisma.inventory.create({ data: inv })))

  // CLIENTS (50+)
  const clientNames = [
    'ООО "Ташкент Маркет"', 'ИП Рашидов А.', 'Супермаркет "Макро"', 'Магазин "Дордой"', 'ООО "Алишер Трейд"',
    'Кафе "Самарканд"', 'Аптека "Шифо"', 'ИП Каримова Г.', 'Оптовый склад "Центр"', 'Магазин "Барака"',
    'ООО "Нилуфар Плюс"', 'Ресторан "Плов-хона"', 'Магазин "Навруз"', 'ИП Юсупов Б.', 'Супермаркет "Корзина"',
    'Аптека "Зиё"', 'ООО "Дилнавоз"', 'Магазин "Умид"', 'Кафе "Достлук"', 'ИП Мирзаев С.',
    'Оптовый "Восток"', 'Магазин "Гулистон"', 'ООО "Эверест Трейд"', 'Ресторан "Бахор"', 'ИП Тошматов Ж.',
    'Супермаркет "Гиперит"', 'Аптека "Са-но"', 'Магазин "Арзон"', 'ООО "АзиаТрейд"', 'Кафе "Шашлычная"',
    'ИП Абдуллаев А.', 'Магазин "Ватан"', 'ООО "Кувват Сервис"', 'Оптовый "Юнус-Абад"', 'Аптека "Исфандиёр"',
    'Магазин "Садо"', 'ИП Баходиров Н.', 'Супермаркет "Хумо"', 'Ресторан "Зафар"', 'ООО "Парис Трейд"',
    'Магазин "Инобат"', 'ИП Холматов К.', 'Аптека "Дориха"', 'Кафе "Тандир"', 'ООО "Омад Сервис"',
    'Магазин "Нурли"', 'Оптовый "Бекобод"', 'ИП Сафаров Р.', 'Супермаркет "Тутти"', 'Ресторан "Тойхона"',
    'Магазин "Мехр"', 'ИП Рузиева М.', 'Аптека "Эскулап"', 'ООО "Зафар Плюс"', 'Кафе "Гурман"',
  ]

  const clientStatuses = ['ACTIVE', 'ACTIVE', 'ACTIVE', 'ACTIVE', 'INACTIVE', 'BLOCKED']
  const clientCategories = ['A', 'A', 'B', 'B', 'B', 'C', 'C']

  const clientsData = clientNames.map((name, i) => ({
    name,
    contactPerson: `Контакт ${i + 1}`,
    phone: `+99890${String(1000000 + i).slice(1)}`,
    email: `client${i + 1}@market.uz`,
    address: `ул. ${['Навоий', 'Амира Темура', 'Мустакиллик', 'Чиланзар', 'Шота Руставели'][i % 5]}, ${i + 1}`,
    region: ['Ташкент', 'Ташкентская обл.', 'Хорезм'][i % 3],
    branchId: branches[i % 5].id,
    clientTypeId: clientTypes[i % 5].id,
    territoryId: territories[i % 6].id,
    category: clientCategories[i % 7],
    status: clientStatuses[i % 6],
    debtLimit: [5000000, 10000000, 15000000, 20000000, 25000000][i % 5],
  }))

  const clients = await Promise.all(clientsData.map(c => prisma.client.create({ data: c })))

  // ROUTES
  const agents = [agent1, agent2, agent3, agent4, agent5, agent6, agent7]
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  const routesCreated = []
  for (let i = 0; i < 10; i++) {
    const route = await prisma.route.create({
      data: {
        name: `Маршрут ${i + 1} — ${['Центр', 'Север', 'Юг', 'Запад', 'Восток'][i % 5]}`,
        agentId: agents[i % agents.length].id,
        branchId: branches[i % 5].id,
        territoryId: territories[i % 6].id,
        dayOfWeek: days[i % 6],
      }
    })
    routesCreated.push(route)
  }

  // ORDERS (100+) and associated data
  const statuses = ['NEW', 'CONFIRMED', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'RETURNED']
  const paymentTypes = ['CASH', 'TRANSFER', 'CREDIT']
  const paymentStatuses = ['UNPAID', 'PARTIAL', 'PAID']

  const now = new Date()
  const orderCount = 300

  for (let i = 0; i < orderCount; i++) {
    const client = clients[i % clients.length]
    const agent = agents[i % agents.length]
    const status = statuses[i % statuses.length]
    const pStatus = paymentStatuses[i % 3]
    
    // Heavily favor today (0) and yesterday (1)
    let daysAgo = Math.floor(Math.random() * 60)
    if (i % 3 === 0) daysAgo = 0 // 1/3 of orders today
    else if (i % 3 === 1) daysAgo = 1 // 1/3 of orders yesterday
    
    const orderDate = new Date(now.getTime() - daysAgo * 86400000)
    // Add random hours to orderDate for nice charts
    orderDate.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60))
    
    const selectedProducts = products.slice(i % 5, (i % 5) + 3)
    const totalAmount = selectedProducts.reduce((sum, p) => sum + p.price * (Math.floor(Math.random() * 10) + 1), 0)
    const orderNumber = `ORD-${String(10000 + i).padStart(5, '0')}`

    const order = await prisma.order.create({
      data: {
        orderNumber,
        clientId: client.id,
        branchId: branches[i % 5].id,
        warehouseId: warehouses[i % 3].id,
        agentId: agent.id,
        status,
        paymentType: paymentTypes[i % 3],
        paymentStatus: pStatus,
        totalAmount,
        discount: Math.floor(totalAmount * 0.05),
        deliveryDate: new Date(orderDate.getTime() + 2 * 86400000),
        createdAt: orderDate,
        items: {
          create: selectedProducts.map(p => ({
            productId: p.id,
            quantity: Math.floor(Math.random() * 10) + 1,
            price: p.price,
            discount: 0,
            total: p.price * (Math.floor(Math.random() * 10) + 1),
          }))
        }
      }
    })

    // PAYMENT for paid orders
    if (pStatus === 'PAID' || pStatus === 'PARTIAL') {
      const payAmount = pStatus === 'PAID' ? totalAmount : totalAmount * 0.5
      await prisma.payment.create({
        data: {
          orderId: order.id,
          clientId: client.id,
          amount: payAmount,
          currency: 'UZS',
          method: paymentTypes[i % 3],
          paidAt: orderDate,
        }
      })
    }

    // DEBT for unpaid/partial orders
    if ((pStatus === 'UNPAID' || pStatus === 'PARTIAL') && status !== 'CANCELLED') {
      const debtAmount = pStatus === 'UNPAID' ? totalAmount : totalAmount * 0.5
      const daysO = Math.floor(Math.random() * 130)
      await prisma.debt.create({
        data: {
          orderId: order.id,
          clientId: client.id,
          amount: debtAmount,
          amountUsd: debtAmount / 12500,
          amountEur: debtAmount / 13800,
          daysOverdue: daysO,
          dueDate: new Date(orderDate.getTime() + 30 * 86400000),
          status: daysO > 0 ? 'ACTIVE' : 'ACTIVE',
        }
      })
    }

    // RETURNS for returned orders
    if (status === 'RETURNED') {
      await prisma.return.create({
        data: {
          orderId: order.id,
          reason: ['Бракованный товар', 'Не соответствует заказу', 'Истёк срок годности', 'Клиент отказался'][i % 4],
          amount: totalAmount * 0.8,
          status: 'APPROVED',
        }
      })
    }
  }

  // VISITS
  const visitStatuses = ['VISITED', 'VISITED', 'VISITED', 'MISSED', 'OUTSIDE_ROUTE']
  for (let i = 0; i < 200; i++) {
    let daysAgo = Math.floor(Math.random() * 30)
    if (i % 3 === 0) daysAgo = 0
    else if (i % 3 === 1) daysAgo = 1
    
    const visitDate = new Date(now.getTime() - daysAgo * 86400000)
    const checkIn = new Date(visitDate.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60)))
    const duration = Math.floor(Math.random() * 60) + 10
    await prisma.visit.create({
      data: {
        clientId: clients[i % clients.length].id,
        agentId: agents[i % agents.length].id,
        routeId: routesCreated[i % routesCreated.length].id,
        checkIn,
        checkOut: new Date(checkIn.getTime() + duration * 60000),
        duration,
        status: visitStatuses[i % visitStatuses.length],
        result: ['Заказ оформлен', 'Оплата получена', 'Клиент не работает', 'Новый клиент'][i % 4],
        hasOrder: i % 3 !== 0,
        visitDate: checkIn,
      }
    })
  }

  // KPI RECORDS
  for (const agent of agents) {
    for (let month = 1; month <= 3; month++) {
      await prisma.kPIRecord.create({
        data: {
          userId: agent.id,
          month,
          year: 2026,
          planVisits: 80,
          actualVisits: Math.floor(Math.random() * 30) + 55,
          planSales: 50000000,
          actualSales: Math.floor(Math.random() * 20000000) + 35000000,
          planOrders: 60,
          actualOrders: Math.floor(Math.random() * 20) + 45,
        }
      })
    }
  }

  // NOTIFICATIONS
  await Promise.all([
    prisma.notification.create({ data: { userId: admin.id, title: 'Новый заказ', message: 'Получен новый заказ от клиента ООО "Ташкент Маркет"', type: 'INFO' } }),
    prisma.notification.create({ data: { userId: admin.id, title: 'Просрочена задолженность', message: 'Клиент ИП Рашидов А. имеет задолженность более 120 дней', type: 'WARNING' } }),
    prisma.notification.create({ data: { userId: admin.id, title: 'Низкий остаток', message: 'Товар "Coca-Cola 0.5л" на складе заканчивается', type: 'WARNING' } }),
    prisma.notification.create({ data: { userId: manager.id, title: 'Отчёт готов', message: 'Ежемесячный отчёт по продажам сформирован', type: 'SUCCESS' } }),
    prisma.notification.create({ data: { userId: admin.id, title: 'Новый сотрудник', message: 'Добавлен новый торговый агент: Зафар Мусаев', type: 'INFO' } }),
  ])

  // FAVORITES
  const favItems = [
    { title: 'Конструктор', url: '/analytics', icon: 'BarChart3' },
    { title: 'Заказы', url: '/sales/orders', icon: 'ShoppingCart' },
    { title: 'Остаток по сериям', url: '/warehouse', icon: 'Package' },
    { title: 'План приемок', url: '/warehouse/incoming', icon: 'Truck' },
    { title: 'Долги клиентов', url: '/debts', icon: 'AlertCircle' },
    { title: 'Клиенты', url: '/clients', icon: 'Users' },
  ]
  await Promise.all(favItems.map((f, i) => prisma.favorite.create({ data: { userId: admin.id, ...f, sortOrder: i } })))

  // ACTIVITY LOGS
  await Promise.all([
    prisma.activityLog.create({ data: { userId: admin.id, action: 'Вход в систему', entity: 'Auth', meta: 'IP: 192.168.1.1' } }),
    prisma.activityLog.create({ data: { userId: manager.id, action: 'Создан заказ', entity: 'Order', entityId: 'ORD-10001' } }),
    prisma.activityLog.create({ data: { userId: agent1.id, action: 'Добавлен клиент', entity: 'Client', entityId: clients[0].id } }),
    prisma.activityLog.create({ data: { userId: finance.id, action: 'Зарегистрирована оплата', entity: 'Payment', meta: '500,000 UZS' } }),
  ])

  console.log('✅ База данных успешно заполнена!')
  console.log(`   ✓ ${branches.length} филиалов`)
  console.log(`   ✓ ${users.length} пользователей`)
  console.log(`   ✓ ${clients.length} клиентов`)
  console.log(`   ✓ ${products.length} товаров`)
  console.log(`   ✓ ${orderCount} заказов`)
  console.log('\n🔑 Учётные данные для входа:')
  console.log('   Администратор: admin@distribcontrol.uz / Admin123')
  console.log('   Менеджер:      manager@distribcontrol.uz / Manager123')
  console.log('   Агент:         agent1@distribcontrol.uz / Agent123')
}

main()
  .catch(e => {
    console.error('❌ Ошибка при заполнении:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
