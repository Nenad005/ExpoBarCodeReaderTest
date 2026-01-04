import { Children, createContext, ReactNode, useContext, useState } from "react";
import { useSession } from "./session-menager";
import { upsertWarehouseItemWarehouseItemsUpdatePost } from "@/backend-client";

type Product = {
    id: string;
    name: string;
    barcode: string;
    price: number;
}

type UpfitItem = {
    product: Product
    club_id: string
    in_club: number
}

type WarehouseItem = {
    product: Product
    club_id: string
    in_warehouse: number
}

type WarehouseItems = Record<string, number>

type InventoryItem = {
    product: Product
    club_id: string
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
    warehouseItems: WarehouseItems | null
    upfitItems: UpfitItem[] | null
    inventoryItems: InventoryItem[] | null
    upfitStatus: LoadingStatus
    warehouseStatus: LoadingStatus
    refetchUpfit: () => Promise<void>
    refetchWarehouse: () => Promise<void>
    updateWarehouseItem: (warehouseItem: WarehouseItem) => Promise<void>
}

const inventoryContext = createContext<inventoryContextType>({} as inventoryContextType)

export const useInventory = () => useContext(inventoryContext)

export const InventoryProvider = ({children} : {children : ReactNode}) => {
    const {session, authorized} = useSession()
    const [warehouseItems, setWareHouseProducts] = useState<WarehouseItems | null>(null)
    const [upfitItems, setUpfitItems] = useState<UpfitItem[] | null>(null)
    const [upfitStatus, setUpfitStatus] = useState<LoadingStatus>(LoadingStatus.Fetching)
    const [warehouseStatus, setWarehouseStatus] = useState<LoadingStatus>(LoadingStatus.Fetching)

    const inventoryItems : InventoryItem[] | null = 
    upfitItems ? 
        warehouseItems ? 
        upfitItems.map((upfitItem) : InventoryItem => {
            let in_warehouse : number | undefined = warehouseItems[upfitItem.product.id]
            if (in_warehouse === undefined) {
                updateWarehouseItem({product: upfitItem.product, club_id: upfitItem.club_id, in_warehouse: 0})
                in_warehouse = 0
            }
            return {...upfitItem, in_warehouse}
        }) 
        : upfitItems.map((upfitItem) : InventoryItem => {
            return {...upfitItem, in_warehouse: null}
        })
    : null

    const updateWarehouseItem = async (warehouseItem: WarehouseItem) => {
        await upsertWarehouseItemWarehouseItemsUpdatePost({body: {
            warehouse_id: warehouseItem.club_id,
            product_id: warehouseItem.product.id,
            quantity: warehouseItem.in_warehouse,
        }})
    }

    const value = {upfitItems, warehouseItems, inventoryItems, updateWarehouseItem} as inventoryContextType

    return <inventoryContext.Provider value={value}>
        {children}
    </inventoryContext.Provider>
}