import { Children, createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useSession } from "./session-menager";
import { bulkUpsertProductsProductsUpdateManyPost, getProductBarcodesProductsBarcodesGet, getWarehouseItemsWarehouseItemsGet, upsertWarehouseItemWarehouseItemsUpdatePost } from "@/backend-client";
import parse from "node-html-parser";

type Product = {
    id: string;
    name: string;
    barcode: string | null;
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

export type InventoryItem = {
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
    Idle,
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
    const [warehouseItems, setWarehouseItems] = useState<WarehouseItems | null>(null)
    const [upfitItems, setUpfitItems] = useState<UpfitItem[] | null>(null)
    const [upfitStatus, setUpfitStatus] = useState<LoadingStatus>(LoadingStatus.Idle)
    const [warehouseStatus, setWarehouseStatus] = useState<LoadingStatus>(LoadingStatus.Idle)
    
    const updateWarehouseItem = async (warehouseItem: WarehouseItem) => {
        console.log(warehouseItem.product.barcode)
        upsertWarehouseItemWarehouseItemsUpdatePost({body: {
            warehouse_id: warehouseItem.club_id,
            product_id: warehouseItem.product.id,
            quantity: warehouseItem.in_warehouse,
        }})
        bulkUpsertProductsProductsUpdateManyPost({body: [warehouseItem.product]})
        let newUpfitItems = upfitItems
        let changedProduct = newUpfitItems?.find((item: UpfitItem) => item.product.id == warehouseItem.product.id)
        if (changedProduct) {
            console.log("nasao proizvod")
            changedProduct.product.barcode = warehouseItem.product.barcode
            setUpfitItems(newUpfitItems)
            console.log("izmenio proizvod")
        }
        console.warn("CHANGED UPFIT ITEMS")
    }
    
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


    const fetchWarehouseItems = async () => {
        if (!session || !authorized) { 
            setWarehouseItems(null)
            setWarehouseStatus(LoadingStatus.Idle)
            return
        }
        setWarehouseStatus(LoadingStatus.Fetching)
        const results = await getWarehouseItemsWarehouseItemsGet({query: {warehouse_id: session.club_id}})
        if (results.error === undefined) {
            const warehouseItemsMap : WarehouseItems = {}
            results.data.forEach(item => {
                warehouseItemsMap[item.product_id] = item.quantity
            });
            setWarehouseItems(warehouseItemsMap)
            setWarehouseStatus(LoadingStatus.Fetched)
        } else {
            setWarehouseStatus(LoadingStatus.NotFound)
        }
    }

    const fetchUpfitItems = async () => {
        if (!session || !authorized) { 
            setUpfitItems(null)
            setUpfitStatus(LoadingStatus.Idle)
            return
        }
        setUpfitStatus(LoadingStatus.Fetching)
        const url = "https://nonstopfitness.upfit.cloud/financial/inventory-clubs";
    
        const cookieHeader = `PHPSESSID=${session.id.trim()}`;
        const upfitResponse = await fetch(url, {
            method: 'GET',
            credentials: 'omit',
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Cookie": cookieHeader,
            },
        });
    
        if (upfitResponse.url && upfitResponse.url !== url) {
            console.error("[Inventory] Redirected to:", upfitResponse.url);
            setUpfitItems(null)
            setUpfitStatus(LoadingStatus.NotFound)
            return
        }
    
        if (!upfitResponse.ok) {
            console.error("Error fetching upfit items")
            setUpfitItems(null)
            setUpfitStatus(LoadingStatus.NotFound)
            return
        }

        const dbResponse = await getProductBarcodesProductsBarcodesGet()
        if (dbResponse.error !== undefined || !dbResponse.data){
            console.error("Error fetching product barcodes")
            setUpfitItems(null)
            setUpfitStatus(LoadingStatus.NotFound)
            return
        }
    
        const text = await upfitResponse.text();
        const doc = parse(text);
    
        const itemElements = doc.querySelectorAll(".odd.gradeX");
        try{
            const items: UpfitItem[] = itemElements.map((itemEl, index) : UpfitItem => {
                const tds = itemEl.querySelectorAll("td");
                const attributes = tds.map((td) => td.textContent.trim());
                const barcode = dbResponse.data[attributes[0]] ?? null
                return {
                    product: {
                        id: attributes[0],
                        name: attributes[1],
                        barcode,
                        price: parseInt(attributes[4].trim().slice(0, -3).replace(" ", "")),
                    },
                    club_id: session.club_id,
                    in_club: parseInt(attributes[2] ?? '0', 10),
                };
            });

            setUpfitItems(items)
            setUpfitStatus(LoadingStatus.Fetched)
        }
        catch {
            console.error("Error parsing upfit data")
            setUpfitItems(null)
            setUpfitStatus(LoadingStatus.NotFound)
            return
        }
    }

    useEffect(() => {
        switch (upfitStatus) {
            case LoadingStatus.Cached:
                console.log("Using cached upfit items...")
                break;
            case LoadingStatus.Fetching:
                console.log("Fetching upfit items...")
                break;
            case LoadingStatus.Fetched:
                console.log("Upfit items fetched successfully")
                upfitItems?.map((item) => {
                    return {
                        name: item.product.name,
                        barcode: item.product.barcode,
                    
                    }
                }).forEach((item) => console.log(item))
                break;
            case LoadingStatus.NotFound:
                console.error("Error: Upfit items not found")
                break;
            case LoadingStatus.Idle:
                console.log("Upfit items idle")
                break;
            default:
                console.log("Error: Unknown upfitStatus", upfitStatus)
                break;
            }
    }, [upfitStatus])

    useEffect(() => {
        switch (warehouseStatus) {
            case LoadingStatus.Cached:
                console.log("Using cached warehouse items...")
                break;
            case LoadingStatus.Fetching:
                console.log("Fetching warehouse items...")
                break;
            case LoadingStatus.Fetched:
                console.log("Warehouse items fetched successfully")
                break;
            case LoadingStatus.NotFound:
                console.error("Error: Warehouse items not found")
                break;
            case LoadingStatus.Idle:
                console.log("Warehouse items idle")
                break;
            default:
                console.log("Error: Unknown warehouseStatus", warehouseStatus)
                break;
            }
    }, [warehouseStatus])
    
    const refetchWarehouse = async () => {
        await fetchWarehouseItems()
    }

    const refetchUpfit = async () => {
        await fetchUpfitItems()
    }

    useEffect(() => {
        if (authorized && session) {
            fetchUpfitItems()
            fetchWarehouseItems()
        }
        else {
            setUpfitItems(null)
            setWarehouseItems(null)
            setUpfitStatus(LoadingStatus.Idle)
            setWarehouseStatus(LoadingStatus.Idle)
        }
    }, [session, authorized])

    const value = {upfitItems, warehouseItems, inventoryItems, upfitStatus, warehouseStatus, updateWarehouseItem, refetchUpfit, refetchWarehouse}

    return <inventoryContext.Provider value={value}>
        {children}
    </inventoryContext.Provider>
}