//Return an effect item based on origin
export const _getSRStatusEffect = async function(origin) {
    let effect;

    switch (origin){
        case "dead": 
            return effect = {
                label: game.i18n.localize("SR5.STATUSES_Dead_F"),
                origin: "dead",
                icon: "systems/sr5/img/status/StatusDeadOn.svg",
                flags: {
                    core: {
                        active: true,
                        overlay: true,
                        statusId: "dead"
                    }
                },
            }

        case "unconscious" :
            return effect = {
                label: game.i18n.localize("SR5.STATUSES_Unconscious_F"),
                origin: "unconscious",
                icon: "systems/sr5/img/status/StatusUnconsciousOn.svg",
                flags: {
                    core: {
                        active: true,
                        statusId: "unconscious"
                    }
                },
            }
        
        case "prone":
            return effect = {
                label: game.i18n.localize("SR5.STATUSES_Prone"),
                origin: "damageTaken",
                icon: "systems/sr5/img/status/StatusProneOn.svg",
                flags: {
                    core: {
                        active: true,
                        statusId: "prone"
                    }
                },
            }

        case "handleVisionAstral":
            return effect = {
                label: game.i18n.localize("SR5.AstralPerception"),
                origin: "handleVisionAstral",
                icon: "systems/sr5/img/status/StatusAstralVisionOn.svg",
                flags: {
                    core: {
                        active: true,
                        statusId: "astralVision"
                    }
                },
            }
            
        case "catchFire":
            return effect = {
                label: game.i18n.localize("SR5.CatchFire"),
                origin: "catchFire",
                icon: "systems/sr5/img/status/StatusInFireOn.svg",
                flags: {
                    core: {
                        active: true,
                        statusId: "catchFire"
                    }
                },
            }
            break;
        default: return null
    }
}