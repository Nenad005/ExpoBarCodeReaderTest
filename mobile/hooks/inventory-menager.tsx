import { Children, createContext, ReactNode, useContext, useState } from "react";

type Product = {
    id: string;
    name: string;
    barcode: string;
    price: number;
}

type UpfitProduct = {
    product: Product
    in_club: number
}

type WarehouseProduct = {
    product: Product
    in_warehouse: number
}

type WarehouseProducts = Record<string, number>

type InventoryItem = {
    product: Product
    in_club: number
    in_warehouse: number | null
}

export enum LoadingStatus {
    Cached,
    NotFound,
    Fetched,
    Fetching,
}

type inventoryContextType = {
    warehouseProducts: WarehouseProducts | null
    upfitProducts: UpfitProduct[] | null
    inventoryItems: InventoryItem[] | null
    upfitStatus: LoadingStatus
    warehouseStatus: LoadingStatus
    refetchUpfit: () => Promise<void>
    refetchWarehouse: () => Promise<void>
    updateWarehouseProduct: (warehouseProduct: WarehouseProduct) => Promise<void>
}

const inventoryContext = createContext<inventoryContextType>({} as inventoryContextType)

export const useInventory = () => useContext(inventoryContext)

export const InventoryProvider = ({children} : {children : ReactNode}) => {
    const [warehouseProducts, setWareHouseProducts] = useState<WarehouseProducts | null>(null)
    const [upfitProducts, setUpfitProducts] = useState<UpfitProduct[] | null>(null)
    const [upfitStatus, setUpfitStatus] = useState<LoadingStatus>(LoadingStatus.Fetching)
    const [warehouseStatus, setWarehouseStatus] = useState<LoadingStatus>(LoadingStatus.Fetching)

    const inventoryItems : InventoryItem[] | null = 
    upfitProducts ? 
        warehouseProducts ? 
        upfitProducts.map((upfitItem) : InventoryItem => {
            let in_warehouse : number | undefined = warehouseProducts[upfitItem.product.id]
            if (in_warehouse === undefined) {
                updateWarehouseProduct({product: upfitItem.product, in_warehouse: 0})
                in_warehouse = 0
            }
            return {...upfitItem, in_warehouse}
        }) 
        : upfitProducts.map((upfitItem) : InventoryItem => {
            return {...upfitItem, in_warehouse: null}
        })
    : null

    const updateWarehouseProduct = async (warehouseProduct: WarehouseProduct) => {
        
    }

    const value = {upfitProducts, warehouseProducts, inventoryItems, updateWarehouseProduct} as inventoryContextType

    return <inventoryContext.Provider value={value}>
        {children}
    </inventoryContext.Provider>
}