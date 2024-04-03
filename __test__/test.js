
import resolve from "../index.js";

const customers = [
    {
        name: 'ABC Supplies',
        city: 'NY',
        email: 'orders@abcsupplies.com'
    },
    {
        name: 'Acme Industries',
        city: 'Wichita',
        email: 'orders@acme.com'
    }
];

const inventoryItems = [
    {
        name: 'item1',
        description: 'Item 1',
        price: 1.00
    },
    {
        name: 'item2',
        description: 'Item 2',
        price: 1.00
    },
    {
        name: 'item3',
        description: 'Item 3',
        price: 1.00
    },
    {
        name: 'item4',
        description: 'Item 4',
        price: 1.00
    },
    {
        name: 'item5',
        description: 'Item 5',
        price: 1.00
    }
];

const company = {
    name: 'Acme Sales',
    industries: ['retail', 'wholesale', 'food service', 'cleaning'],
    regions: {
        east: {
            name: 'East',
            manager: { name: 'John', scale: 'H', years: 9 },
            orders: [
                {
                    orderNo: 1,
                    date: '2021-05-14',
                    customer: customers[0],
                    items: [{ item: inventoryItems[0], qty: 2 }, { item: inventoryItems[4], qty: 2 }],
                    total: 10.00
                },
                {
                    orderNo: 2,
                    date: '2021-05-24',
                    customer: customers[0],
                    items: [{ item: inventoryItems[0], qty: 2 }, { item: inventoryItems[4], qty: 2 }],
                    total: 20.00
                },
                {
                    orderNo: 3,
                    date: '2021-06-14',
                    customer: customers[0],
                    items: [{ item: inventoryItems[0], qty: 2 }, { item: inventoryItems[4], qty: 2 }],
                    total: 30.00
                }
            ]
        },
        central: {
            name: 'Central',
            divisions: {
                north: {
                    name: 'Central North',
                    manager: { name: 'Sue', bonus: 15 },
                    orders: [
                        {
                            orderNo: 1,
                            date: '2021-07-14',
                            customer: customers[1],
                            items: [{ item: inventoryItems[0], qty: 2 }, { item: inventoryItems[1], qty: 2 }],
                            total: 10.00
                        },
                        {
                            orderNo: 2,
                            date: '2021-08-24',
                            customer: customers[1],
                            items: [{ item: inventoryItems[2], qty: 2 }, { item: inventoryItems[3], qty: 2 }],
                            total: 20.00
                        }
                    ]
                },
                south: {
                    name: 'Central South',
                    manager: { name: 'Tom', bonus: { lastyear: { amount: 2 } } }
                }
            }
        },
        west: {
            name: 'West',
            manager: { name: 'Jane', bonus: 7, years: 3 },
            orders: null
        }
    }
};

let path = '';
let res = undefined;

test('regions.east.manager', () => {
    expect(resolve('regions.east.manager', company)).toStrictEqual({ "name": "John", "scale": "H", "years": 9 });
});

test('regions.*.manager', () => {
    expect(resolve('regions.*.manager', company)).toStrictEqual([{ "name": "John", "scale": "H", "years": 9 }, { "name": "Jane", "bonus": 7, "years": 3 }]);
});

test('regions.*.["manager"]', () => {
    expect(resolve('regions.*.["manager"]', company)).toStrictEqual([{ "name": "John", "scale": "H", "years": 9 }, { "name": "Jane", "bonus": 7, "years": 3 }]);
});

test('regions.**.manager', () => {
    expect(resolve('regions.**.manager', company)).toStrictEqual([{ "name": "John", "scale": "H", "years": 9 }, { "name": "Jane", "bonus": 7, "years": 3 }, { "name": "Sue", "bonus": 15 }, { "name": "Tom", "bonus": { "lastyear": { "amount": 2 } } }]);
});

test('regions.*.?divisions[].name', () => {
    expect(resolve('regions.*.?divisions[].name', company)).toStrictEqual(["East", "Central", "West", "Central North", "Central South"]);
});

test('**.orders[].customer', () => {
    expect(resolve('**.orders[].customer', company)).toStrictEqual([{ "name": "ABC Supplies", "city": "NY", "email": "orders@abcsupplies.com" }, { "name": "ABC Supplies", "city": "NY", "email": "orders@abcsupplies.com" }, { "name": "ABC Supplies", "city": "NY", "email": "orders@abcsupplies.com" }, { "name": "Acme Industries", "city": "Wichita", "email": "orders@acme.com" }, { "name": "Acme Industries", "city": "Wichita", "email": "orders@acme.com" }]);
});

test('**.orders[].customer.*', () => {
    expect(resolve('**.orders[].customer.*', company)).toStrictEqual([{ "name": "ABC Supplies", "city": "NY", "email": "orders@abcsupplies.com" }, { "name": "Acme Industries", "city": "Wichita", "email": "orders@acme.com" }]);
});

test('regions.east.orders[first].total', () => {
    expect(resolve('regions.east.orders[first].total', company)).toStrictEqual(10);
});

test('**.east.orders[].*', () => {
    expect(resolve('**.east.orders[].*', company)).toStrictEqual([{ "orderNo": 1, "date": "2021-05-14", "customer": { "name": "ABC Supplies", "city": "NY", "email": "orders@abcsupplies.com" }, "items": [{ "item": { "name": "item1", "description": "Item 1", "price": 1 }, "qty": 2 }, { "item": { "name": "item5", "description": "Item 5", "price": 1 }, "qty": 2 }], "total": 10 }, { "orderNo": 2, "date": "2021-05-24", "customer": { "name": "ABC Supplies", "city": "NY", "email": "orders@abcsupplies.com" }, "items": [{ "item": { "name": "item1", "description": "Item 1", "price": 1 }, "qty": 2 }, { "item": { "name": "item5", "description": "Item 5", "price": 1 }, "qty": 2 }], "total": 20 }, { "orderNo": 3, "date": "2021-06-14", "customer": { "name": "ABC Supplies", "city": "NY", "email": "orders@abcsupplies.com" }, "items": [{ "item": { "name": "item1", "description": "Item 1", "price": 1 }, "qty": 2 }, { "item": { "name": "item5", "description": "Item 5", "price": 1 }, "qty": 2 }], "total": 30 }]);
});

test('**.orders[0].customer', () => {
    expect(resolve('**.orders[0].customer', company)).toStrictEqual([{ "name": "ABC Supplies", "city": "NY", "email": "orders@abcsupplies.com" }, { "name": "Acme Industries", "city": "Wichita", "email": "orders@acme.com" }]);
});

test('**.orders[last]', () => {
    expect(resolve('**.orders[last]', company)).toStrictEqual([{ "orderNo": 3, "date": "2021-06-14", "customer": { "name": "ABC Supplies", "city": "NY", "email": "orders@abcsupplies.com" }, "items": [{ "item": { "name": "item1", "description": "Item 1", "price": 1 }, "qty": 2 }, { "item": { "name": "item5", "description": "Item 5", "price": 1 }, "qty": 2 }], "total": 30 }, { "orderNo": 2, "date": "2021-08-24", "customer": { "name": "Acme Industries", "city": "Wichita", "email": "orders@acme.com" }, "items": [{ "item": { "name": "item3", "description": "Item 3", "price": 1 }, "qty": 2 }, { "item": { "name": "item4", "description": "Item 4", "price": 1 }, "qty": 2 }], "total": 20 }]);
});
