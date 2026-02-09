import { DependencyContainer } from "tsyringe";

import { ILogger } from "@spt/models/spt/utils/ILogger";
import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { IDatabaseTables } from "@spt/models/spt/server/IDatabaseTables";
import { NewItemFromCloneDetails } from "@spt/models/spt/mod/NewItemDetails";
import { CustomItemService } from "@spt/services/mod/CustomItemService";

// MATCH AMMO
const handLoadedAmmoDescription = "\n\nCarefully hand picked from a larger batch of the same ammo, and loaded with high quality gunpowder for a more consistent velocity.";

// BARTER ITEMS
const gunpowderHawk = "5d6fc87386f77449db3db94e";

// STOCKS
const scarStock = "618167528004cc50514c34f9";
const scarStockFDE = "61825d136ef05c2ce828f1cc";

const scarStockVltorFDE = "66ffc2ecfe9b3825960652f7";
const scarStockVltor = "66ffc2bd132225f0fe0611d8";

const scarStockFolding = "61816734d8e3106d9806c1f3";
const scarStockFoldingFDE = "61825d06d92c473c770215de";

const scarButtpad = "618167616ef05c2ce828f1a8";

// RAILS
const scarPMMRail = "66ffc72082d36dec82030c1f";
const scarPMMRailFDE = "66ffc903fe9b382596065304";
const scarPMMRailExtension = "66ffe2fbab3336cc0106382b";
const scarPMMRailExtensionFDE = "66ffe5edfe9b38259606530d";
const scarBottomRail = "61816df1d3a39d50044c139e";
const scarPwsSrxRailExtension = "61965d9058ef8c428c287e0d";
const scarVltorCasv = "66ffe811f5d758d71101e89a";
const scarVltorCasvFDE = "66ffea06132225f0fe061394";
const scarMrex = "619666f4af1f5202c57a952d";
const scarMrexFDE = "66ffc6ceb7ff397142017c3a";
const scarVltorCasvExtension = "66ffea456be19fd81e0ef742";
const scarVltorCasvExtensionFDE = "66ffeab4ab3336cc01063833";


// GUNS
const scarHFDE = "6165ac306ef05c2ce828ef74";
const scarH = "6183afd850224f204c1da514";
const x17 = "676176d362e0497044079f4c";
const scarL = "6184055050224f204c1da540";
const scarLFDE = "618428466ef05c2ce828f218";

// MAGAZINES
const scarHMag = "618168dc8004cc50514c34fc";
const scarHMagFDE = "6183d53f1cb55961fa0fdcda";
const ar10Lancer = "65293c38fc460e50a509cb25";

// BARRELS
const scarH16in = "6183b0711cb55961fa0fdcad";
const scarH20in = "6183b084a112697a4b3a6e6c";
const scarH13in = "618168b350224f204c1da4d8";

// AMMO
const tcw_sp_762 = "5e023e6e34d52a55c3304f71";
const tcw_sp_762_match = "697f2108910ec639c9c5c5cf";
const genericAmmo = "5485a8684bdc2da71d8b4567";

class Mod implements IPostDBLoadMod
{
    tables: IDatabaseTables;
    logger: ILogger;

    public postDBLoad(container: DependencyContainer): void
    {
        this.logger = container.resolve<ILogger>("WinstonLogger");


        // get database from the server
        const customItem = container.resolve<CustomItemService>("CustomItemService");
        const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
        this.tables = databaseServer.getTables();
        // this.logger.info(Object.keys(tables));

        this.rebalanceScar();
        this.capIronSights();
        this.matchAmmo(customItem);
        this.addAmmoIfOther(tcw_sp_762_match, tcw_sp_762);
    }

    public rebalanceScar(): void {
        // Total buff to accuracy
        // SCAR should be more accurate
        [[scarH13in, 0.8], [scarH16in, 0.9], [scarH20in, 0.9]].forEach((value: [string, number]) => {
            this.tables.templates.items[value[0]]._props.CenterOfImpact *= value[1];
        });

        // Power neutral
        // Early game buff
        // This leaves Vltor with 2 RR more than default
        this.moveRecoil(
            [scarStockVltor, scarStockVltorFDE],
            [scarStockFolding, scarStockFoldingFDE],
            -2
        );

        // End game versatility but not buff
        // Make default stock 4 ergo better than vltor stock (still 2 recoil reduction worse)
        // Big early game buff
        [scarStock, scarStockFDE].forEach((value) => {
            this.setErgo(
                value, this.getErgo(scarStockVltor) + 4 - this.getErgo(scarButtpad)
            );
        });
    }

    public capIronSights(): void {
        // Cap ergo on all irons to 0
        Object.keys(this.tables.templates.items).forEach((value) => {
            if (this.tables.templates.items[value]._props) {
                if (this.tables.templates.items[value]._props.sightModType == "iron") {
                    if (this.getErgo(value) > 0) {
                        this.setErgo(value, 0);
                    }
                }
            }
        });
    }

    public addAmmoIfOther(new_ammo: string, required_ammo: string): void {
        Object.keys(this.tables.templates.items).forEach((value) => {
            const item = this.tables.templates.items[value]

            // if (item?._props?.Chambers) {
            //     this.logger.info(item?._name);
            // }
            item?._props?.Chambers?.forEach((chamber: any) => {
                // this.logger.info("-processing a chamber");

                chamber?._props?.filters.forEach((entry: any) => {
                    // this.logger.info("--processing a filter");
                    if (entry?.Filter?.includes(required_ammo)) {
                        entry?.Filter?.push(new_ammo);
                    }
                });
            });

            // if (item?._props?.Cartridges) {
            //     this.logger.info(item?._name);
            // };

            item?._props?.Cartridges?.forEach((cartridge: any) => {
                // this.logger.info("-processing a magazine");
                cartridge?._props?.filters?.forEach((entry: any) => {
                    // this.logger.info("--processing a filter");
                    if (entry?.Filter?.includes(required_ammo)) {
                        entry?.Filter?.push(new_ammo);
                    }
                });
            });
        });
    }

    public matchAmmo(customItem): void {
        const customItemObject: NewItemFromCloneDetails = {
            itemTplToClone: tcw_sp_762,
            overrideProperties: {
                Name: "7.62x51mm TCW SP Match",
                ShortName: "TCW Match",
                Description: "A 7.62x51mm cartridge with a 10.7 gram lead core soft-point (SP) bullet with a bimetallic semi-jacket in a steel case; intended for hunting, home defense, and target practice, produced by Tula Cartridge Works. This cartridge is aimed at the amateur public, both hunting, recreational and sport shooting, thanks to its versatility, as well as being able to pierce through basic ballistic body protections and providing excellent results against intermediate models, however, it has a high probability of bouncing off various surfaces." + handLoadedAmmoDescription,
            },
            parentId: genericAmmo,
            newId: tcw_sp_762_match,
            fleaPriceRoubles: 400,
            handbookPriceRoubles: 400,
            handbookParentId: "5b47574386f77428ca22b33b",
            locales: {
                en: {
                name: "7.62x51mm TCW SP Match",
                shortName: "TCW Match",
                description: "A 7.62x51mm cartridge with a 10.7 gram lead core soft-point (SP) bullet with a bimetallic semi-jacket in a steel case; intended for hunting, home defense, and target practice, produced by Tula Cartridge Works. This cartridge is aimed at the amateur public, both hunting, recreational and sport shooting, thanks to its versatility, as well as being able to pierce through basic ballistic body protections and providing excellent results against intermediate models, however, it has a high probability of bouncing off various surfaces." + handLoadedAmmoDescription,
                }
            }
        };
        customItem.createItemFromClone(customItemObject);
        this.tables.templates.items[tcw_sp_762_match]._props.ammoAccr = 20;

        // CRAFTING
        // Area	ID
        // Workbench	10
        // Lavatory	3
        // Medstation	7
        // Nutrition Unit	5
        // Intelligence Center	11
        const areaTypeWorkbench = 10;

        const output = 80;
        const tcw_sp_match_craft = "697f237311db741e2dad457f";

        this.tables.hideout.production.recipes.push({
            "_id": tcw_sp_match_craft,
            "areaType": 10,
            "continuous": false,
            "count": output,
            "endProduct": tcw_sp_762_match,
            "isCodeProduction": false,
            "isEncoded": false,
            "locked": false,
            "needFuelForAllProductionTime": false,
            "productionLimitCount": 0,
            "productionTime": output * 3.5 * 60,
            "requirements": [
                {
                    "areaType": areaTypeWorkbench,
                    "requiredLevel": 2,
                    "type": "Area"
                },
                {
                    "count": output * 2,
                    "isEncoded": false,
                    "isFunctional": false,
                    "isSpawnedInSession": false,
                    "templateId": tcw_sp_762,
                    "type": "Item"
                },
                {
                    "count": 1,
                    "isEncoded": false,
                    "isFunctional": false,
                    "isSpawnedInSession": false,
                    "templateId": gunpowderHawk,
                    "type": "Item"
                },
                {
                    "templateId": "544fb5454bdc2df8738b456a",
                    "type": "Tool"
                }
            ]
        });
    }

    public moveRecoil(from_list: string[], to_list: string[], value: number): void {
        to_list.forEach((item) => {
            this.addRecoil(item, -value);
        });
        from_list.forEach((item) => {
            this.addRecoil(item, -value);
        });
    }
    public moveErgo(from_list: string[], to_list: string[], value: number): void {
        to_list.forEach((item) => {
            this.addErgo(item, -value);
        });
        from_list.forEach((item) => {
            this.addErgo(item, -value);
        });
    }

    public setRecoil(item, value): void {
        this.tables.templates.items[item]._props.Recoil = value;
    }

    public getRecoil(item) {
        return this.tables.templates.items[item]._props.Recoil;
    }

    public addRecoil(item, value): void {

        this.setRecoil(item, this.getRecoil(item) + value)
    }

    public setErgo(item, value): void {
        this.tables.templates.items[item]._props.Ergonomics = value;
    }

    public getErgo(item) {
        return this.tables.templates.items[item]._props.Ergonomics;
    }

    public addErgo(item, value): void {
        this.setErgo(item, this.getErgo(item) + value)
    }
}

export const mod = new Mod();

