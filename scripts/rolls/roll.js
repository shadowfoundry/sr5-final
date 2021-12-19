// Test d'attribut simple
import { SR5 } from "../config.js";
import { SR5_Dice } from "./dice.js";
import { SR5_RollMessage } from "./roll-message.js";
import { SR5_DiceHelper } from "./diceHelper.js";
import { SR5_EntityHelpers } from "../entities/helpers.js";
import AbilityTemplate from "../canvas-template.js";
import { SR5_SystemHelpers } from "../system/utility.js";

export class SR5_Roll {

    static async actorRoll(entity, rollType, rollKey, chatData) {
        let actor,
            item,
            actorData,
            itemData,
            title = "",
            typeSub,
            testType = "nonOpposedTest",
            dicePool = 0,
            limit,
            optionalData = {},
            matrixAction,
            resonanceAction,
            skill,
            penalties = 0,
            speakerActor,
            speakerId,
            speakerImg,
            activeScene,
            backgroundCount,
            backgroundAlignement, 
            sceneNoise;

        if (entity.documentName === "Actor") {
            actor = entity;
            actorData = entity.data.data;
            if (actor.isToken){
                speakerActor = actor.token.name;
                speakerId = actor.token.id;
                speakerImg = actor.token.data.img;
            } else {
                speakerId = actor.id;
                let token = canvas.scene?.data?.tokens.find((t) => t.data.actorId === speakerId);
                if (token){
                    speakerActor = token.data.name;
                    speakerImg = token.data.img;
                } else {
                    speakerActor = actor.name;
                    speakerImg = actor.img;
                }
            }
            matrixAction = actorData.matrix?.actions[rollKey];
            resonanceAction = actorData.matrix?.resonanceActions[rollKey];
            if (actor.data.type !== "actorDevice"){ 
                skill = actorData.skills[rollKey];
                //calcul penalties
                if(actorData.penalties){
                    penalties = actorData.penalties.condition.actual.value
                                + actorData.penalties.matrix.actual.value
                                + actorData.penalties.magic.actual.value
                                + actorData.penalties.special.actual.value;
                }
            }
        }

        if (entity.documentName === "Item"){
            item = entity;
            itemData = entity.data.data;
            actor = item.actor;
            actorData = actor.data.data;
            if (actor.isToken){
                speakerActor = actor.token.name;
                speakerId = actor.token.id;
                speakerImg = actor.token.data.img;
            } else {
                speakerId = actor.id;
                let token = canvas.scene?.data?.tokens.find((t) => t.data.actorId === speakerId);
                if (token){
                    speakerActor = token.data.name;
                    speakerImg = token.data.img;
                } else {
                    speakerActor = actor.name;
                    speakerImg = actor.img;
                }
            }
        }

        if (canvas.scene) {
            activeScene = game.scenes.active;
            sceneNoise = -activeScene.getFlag("sr5", "matrixNoise") || 0;
            backgroundCount = activeScene.getFlag("sr5", "backgroundCountValue") || 0;
            backgroundAlignement = activeScene.getFlag("sr5", "backgroundCountAlignement") || "";
        }

        switch (rollType){
            case "attribute":
                if (actor.data.type === "actorDrone") title = `${game.i18n.localize("SR5.AttributeTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.vehicleAttributes[rollKey])}`;
                else title = `${game.i18n.localize("SR5.AttributeTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.allAttributes[rollKey])}`;
                dicePool = actorData.attributes[rollKey]?.augmented.value;
                if (dicePool === undefined) dicePool = actorData.specialAttributes[rollKey].augmented.value;
                optionalData = {
                    "switch.attribute": true,
                    "switch.penalty": true,
                    "switch.extended": true,
                    penaltyValue: penalties,
                }
                break;

            case "skill":
                title = `${game.i18n.localize("SR5.SkillTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.skills[rollKey])}`;
                dicePool = actorData.skills[rollKey].rating.value;
                typeSub = rollKey;
                //TODO : find a solution for skill with limit depending on item.
                switch(rollKey){
                    case "spellcasting":
                    case "preparationForce":
                    case "vehicleHandling":
                    case "weaponAccuracy":
                    case "formulaForce":
                    case "spiritForce":
                        limit = 0;
                        break;
                    default:
                        limit = skill.limit.value;
                }
                optionalData = {
                    "switch.attribute": true,
                    attributeKey: actorData.skills[rollKey].linkedAttribute,
                    "switch.penalty": true,
                    penaltyValue: penalties,
                    "switch.specialization": true,
                    "switch.extended": true,
                    limitType: skill.limit.base,
                    "sceneData.backgroundCount" : backgroundCount,
                    "sceneData.backgroundAlignement" : backgroundAlignement,
                }
                break;

            case "languageSkill":
            case "knowledgeSkill":
                title = `${game.i18n.localize("SR5.SkillTest") + game.i18n.localize("SR5.Colons") + " " + item.name}`;
                dicePool = itemData.value;
                break;

            case "skillDicePool":
                if (actor.data.type === "actorDrone") {
                    if (actorData.controlMode === "autopilot") title = `${game.i18n.localize("SR5.SkillTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.skills[rollKey]) + " + " + game.i18n.localize(SR5.vehicleAttributes[skill.linkedAttribute])}`;
                    else title = `${game.i18n.localize("SR5.SkillTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.skills[rollKey])}`;
                } else title = `${game.i18n.localize("SR5.SkillTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.skills[rollKey]) + " + " + game.i18n.localize(SR5.allAttributes[skill.linkedAttribute])}`;
                dicePool = actorData.skills[rollKey].test.dicePool;
                typeSub = rollKey;
                //TODO : find a solution for skill with limit depending on item.
                switch(rollKey){
                    case "spellcasting":
                    case "preparationForce":
                    case "vehicleHandling":
                    case "weaponAccuracy":
                    case "formulaForce":
                    case "spiritForce":
                        limit = 0;
                        break;
                    default:
                        limit = skill.limit.value;
                }
                optionalData = {
                    "switch.extended": true,
                    "switch.specialization": true,
                    limitType: skill.limit.base,
                    "sceneData.backgroundCount": backgroundCount,
                    "sceneData.backgroundAlignement": backgroundAlignement,
                }
                break;

            case "resistance":
                let subKey = rollKey.split("_").pop();
                let resistanceKey = rollKey.split("_").shift();
                switch (resistanceKey){
                    case "physicalDamage":
                        dicePool = actorData.resistances.physicalDamage.dicePool;
                        title = game.i18n.localize(SR5.characterResistances.physicalDamage);
                        break;
                    case "directSpellMana":
                        dicePool = actorData.resistances.directSpellMana.dicePool;
                        title = game.i18n.localize(SR5.characterResistances.directSpellMana);
                        break;
                    case "directSpellPhysical":
                        dicePool = actorData.resistances.directSpellPhysical.dicePool;
                        title = game.i18n.localize(SR5.characterResistances.directSpellPhysical);
                        break;
                    case "toxin":
                        dicePool = actorData.resistances.toxin[subKey].dicePool;
                        title = game.i18n.localize(SR5.characterResistances.toxin) + " (" + game.i18n.localize(SR5.propagationVectors[subKey]) + ")";
                        break;
                    case "disease":
                        dicePool = actorData.resistances.disease[subKey].dicePool;
                        title = game.i18n.localize(SR5.characterResistances.disease) + " (" + game.i18n.localize(SR5.propagationVectors[subKey]) + ")";
                        break;
                    case "specialDamage":
                        dicePool = actorData.resistances.specialDamage[subKey].dicePool;
                        title = game.i18n.localize(SR5.characterResistances.specialDamage) + " (" + game.i18n.localize(SR5.specialDamageTypes[subKey]) + ")";
                        break;
                    default:
                        SR5_SystemHelpers.srLog(1, `Unknown '${resistanceKey}' Damage Resistance Type in roll`);
                }
                break;

            case "resistanceCard":
                title = game.i18n.localize("SR5.TakeOnDamage") //TODO:  add details

                //handle distance between defenser and explosive device
                if (chatData.item?.data.category === "grenade" 
                 || chatData.item?.data.type === "grenadeLauncher" 
                 || chatData.item?.data.type === "missileLauncher"){
                    let grenadePosition = SR5_SystemHelpers.getTemplateItemPosition(chatData.item._id);          
                    let defenserPosition = SR5_EntityHelpers.getActorCanvasPosition(actor);
                    let distance = SR5_SystemHelpers.getDistanceBetweenTwoPoint(grenadePosition, defenserPosition);
                    let modToDamage = distance * (chatData.item.data.blast.damageFallOff || 0);
                    chatData.damageValue = chatData.damageValueBase + modToDamage;
                    if (modToDamage === 0) ui.notifications.info(`${game.i18n.format("SR5.INFO_GrenadeTargetDistance", {distance:distance})}`);
                    else ui.notifications.info(`${game.i18n.format("SR5.INFO_GrenadeTargetDistanceFallOff", {distance:distance, modifiedDamage: modToDamage, finalDamage: chatData.damageValue})}`);
                    if (chatData.damageValue <=0) {
                        ui.notifications.info(`${game.i18n.localize("SR5.INFO_TargetIsTooFar")}`);
                        return;
                    }
                }

                switch (chatData.damageResistanceType){
                    case "physicalDamage":
                        title = `${game.i18n.localize("SR5.TakeOnDamagePhysical")} (${chatData.damageValue})`; //TODO: add details
                        typeSub = "physicalDamage";
                        let armor, resistanceValue;

                        switch (actor.data.type){
                            case "actorDrone":                                
                                armor = actorData.attributes.armor.augmented.value;
                                resistanceValue = actorData.resistances.physicalDamage.dicePool - armor;
                                if (chatData.damageValue < (armor + chatData.incomingPA)) {
                                    ui.notifications.info(`${game.i18n.format("SR5.INFO_ArmorGreaterThanDV", {armor: armor + chatData.incomingPA, damage:chatData.damageValue})}`); 
                                    return;
                                }
                                if (chatData.damageType === "stun") {
                                    ui.notifications.info(`${game.i18n.localize("SR5.INFO_ImmunityToStunDamage")}`);
                                    return;
                                }
                                break;
                            case "actorSpirit":
                                armor = actorData.essence.value * 2;
                                if (chatData.damageValue < (armor + chatData.incomingPA)) {
                                    ui.notifications.info(`${game.i18n.format("SR5.INFO_ImmunityToNormalWeapons", {essence: armor, pa: chatData.incomingPA, damage: chatData.damageValue})}`);
                                    return;    
                                }
                                resistanceValue = actorData.resistances.physicalDamage.dicePool;
                                break;
                            case "actorPc":
                            case "actorGrunt":
                                armor = actorData.itemsProperties.armor.value;
                                if (chatData.damageElement) {
                                    let element = chatData.damageElement;
                                    armor += actorData.itemsProperties.armor.specialDamage[element].value;
                                    resistanceValue = actorData.resistances.specialDamage[element].dicePool - armor;
                                } else {
                                    resistanceValue = actorData.resistances.physicalDamage.dicePool - armor;
                                }
                                if (chatData.damageValue < (armor + chatData.incomingPA)) chatData.damageType = "stun";
                                break;
                            default:
                        }

                        let modifiedArmor = armor + chatData.incomingPA;
                        if (modifiedArmor < 0) modifiedArmor = 0;
                        dicePool = resistanceValue + modifiedArmor;

                        optionalData = {
                            chatActionType: "msgTest_damage",
                            incomingPA: chatData.incomingPA,
                            armor: armor,
                            damageValueBase: chatData.damageValue,
                            damageType: chatData.damageType,
                            damageElement: chatData.damageElement,
                            dicePoolBase : resistanceValue
                        }
                        break;
                    case "directSpellMana":       
                        if (actor.type === "actorDrone" || actor.type === "actorDevice" || actor.type === "actorSprite") return ui.notifications.info(`${game.i18n.format("SR5.INFO_ImmunityToManaSpell", {type: game.i18n.localize(SR5.actorTypes[actor.type])})}`);
                        title = `${game.i18n.localize("SR5.ResistanceTest")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.characterResistances[chatData.damageResistanceType])} (${chatData.damageValue})`;
                        dicePool = actorData.resistances[chatData.damageResistanceType].dicePool;
                        typeSub = "spellDamage";
                        optionalData = {
                            chatActionType: "msgTest_damage",
                            damageValueBase: chatData.damageValue,
                            damageType: chatData.damageType,
                            damageElement: chatData.damageElement,
                        }
                        break;
                    
                    case "directSpellPhysical":
                        if (actor.type === "actorDevice" || actor.type === "actorSprite") return ui.notifications.info(`${game.i18n.format("SR5.INFO_ImmunityToPhysicalSpell", {type: game.i18n.localize(SR5.actorTypes[actor.type])})}`);
                        title = `${game.i18n.localize("SR5.ResistanceTest")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.characterResistances[chatData.damageResistanceType])} (${chatData.damageValue})`;
                        dicePool = actorData.resistances[chatData.damageResistanceType].dicePool;
                        typeSub = "manaSpellDamage";
                        optionalData = {
                            chatActionType: "msgTest_damage",
                            damageValueBase: chatData.damageValue,
                            damageType: chatData.damageType,
                            damageElement: chatData.damageElement,
                        }
                        break;
                    case "biofeedback":
                        dicePool = actorData.matrix.resistances.biofeedback.dicePool;
                        typeSub = "biofeedbackDamage";
                        title = `${game.i18n.localize("SR5.ResistBiofeedbackDamage")} (${chatData.damageValue})`;
                        let damageType;
                        if (chatData.blackout) {
                            damageType = "stun";
                        } else {
                            if (actorData.matrix.userMode === "coldsim") damageType = "stun";
                            else if (actorData.matrix.userMode === "hotsim") damageType = "physical";
                        }
                        optionalData = {
                            chatActionType: "msgTest_damage",
                            damageType: damageType,
                            damageValueBase: chatData.damageValue,
                        }
                        break;
                    case "dumpshock":
                        dicePool = actorData.matrix.resistances.dumpshock.dicePool;
                        typeSub = "biofeedbackDamage";
                        title = `${game.i18n.localize("SR5.ResistDumpshock")} (6)`;
                        let dumpshockType;
                        if (actorData.matrix.userMode === "coldsim") dumpshockType = "stun";
                        else if (actorData.matrix.userMode === "hotsim") dumpshockType = "physical";
                        optionalData = {
                            chatActionType: "msgTest_damage",
                            damageType: dumpshockType,
                            damageValueBase: 6,
                        }
                        break;
                    default:
                        SR5_SystemHelpers.srLog(1, `Unknown '${chatData.damageResistanceType}' Damage Resistance Type in roll`);
                }
                break;

            case "derivedAttribute":
                title = `${game.i18n.localize("SR5.DerivedAttributeTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.characterDerivedAttributes[rollKey])}`;
                dicePool = actorData.derivedAttributes[rollKey].dicePool;
                break;

            case "lift":
                title = `${game.i18n.localize("SR5.CarryingTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.weightActions[rollKey])}`;
                dicePool = actorData.weightActions[rollKey].test.dicePool;
                typeSub = rollKey;
                optionalData = {
                    derivedBaseValue: actorData.weightActions[rollKey].baseWeight.value,
                    derivedExtraValue: actorData.weightActions[rollKey].extraWeight.value
                }
                break;

            case "movement":
                title = `${game.i18n.localize("SR5.MovementTest")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.movements[rollKey])}`;
                dicePool = actorData.movements[rollKey].test.dicePool;
                typeSub = rollKey;
                limit = actorData.movements[rollKey].limit.value;
                let unit;
                switch (rollKey){
                    case "treadWater":
                    unit = `${game.i18n.localize("SR5.MinuteUnit")}`;
                    break;
                case "holdBreath":
                    unit = `${game.i18n.localize("SR5.SecondUnit")}`;
                    break;
                default:
                    unit = `${game.i18n.localize("SR5.MeterUnit")}`;
                }

                optionalData = {
                    derivedBaseValue: actorData.movements[rollKey].movement.value,
                    derivedExtraValue: actorData.movements[rollKey].extraMovement.value,
                    unit: unit
                }
                break;

            case "matrixIceAttack":
                title = `${game.i18n.localize("SR5.IceAttack")}`;
                dicePool = actorData.matrix.ice.attackDicepool;
                limit = actorData.matrix.attributes.attack.value;
                optionalData = {
                    chatActionType: "msgTest_iceDefense",
                    typeSub: actorData.matrix.deviceSubType,
                    matrixDamageValue: actorData.matrix.attributes.attack.value,
                    defenseFirstAttribute: actorData.matrix.ice.defenseFirstAttribute,
                    defenseSecondAttribute: actorData.matrix.ice.defenseSecondAttribute,
                }
                break
            
            case "iceDefense":
                title = game.i18n.localize("SR5.Defense");
                let iceFirstAttribute, iceSecondAttribute;
                iceFirstAttribute = actorData.attributes[chatData.defenseFirstAttribute].augmented.value || 0;
                iceSecondAttribute = actorData.matrix.attributes[chatData.defenseSecondAttribute].value || 0;
                dicePool = iceFirstAttribute + iceSecondAttribute;
                optionalData = {
                    hits: chatData.test.hits,
                    iceType: chatData.typeSub,
                    matrixActionAuthor: chatData?.matrixActionAuthor,
                    matrixDamageValueBase: chatData.matrixDamageValue,
                    mark: chatData?.mark,
                    defenseFull: actorData.attributes?.willpower?.augmented.value || 0,
                }
                break;

            case "matrixAction":
                title = `${game.i18n.localize("SR5.MatrixActionTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.matrixRolledActions[rollKey])}`;
                dicePool = matrixAction.test.dicePool;
                limit = matrixAction.limit.value;
                typeSub = rollKey;
                if (matrixAction.defense.dicePool) testType = "opposedTest";
                
                //Check target's Marks before rolling if a target is selected.
                if (game.user.targets.size && matrixAction.neededMarks > 0) {
                    let attaquantID;
                    if (this.token) attaquantID = this.token.data.id;
                    else attaquantID = this.data.id;
                    const targeted = game.user.targets;
                    const cibles = Array.from(targeted);
                    for (let t of cibles) {
                        let markItem = t.actor.data.items.find((i) => i.data.owner === attaquantID);
                        if (markItem === undefined || markItem?.value < matrixAction.neededMarks) {
                            ui.notifications.info(game.i18n.localize("SR5.NotEnoughMarksOnTarget"));
                            return;
                        }
                    }
                }

                optionalData = {
                    limitType: matrixAction.limit.linkedAttribute,
                    chatActionType: "msgTest_matrixDefense",
                    matrixActionType: matrixAction.limit.linkedAttribute,
                    overwatchScore: matrixAction.increaseOverwatchScore,
                    "dicePoolMod.matrixNoiseScene": sceneNoise,
                    "dicePoolMod.matrixNoiseReduction": actorData.matrix.attributes.noiseReduction.value,
                }
                
                if (typeSub === "dataSpike"){
                    optionalData = mergeObject(optionalData, {
                        matrixDamageValueBase: actorData.matrix.attributes.attack.value,
                    });
                }

                break;

            case "matrixSimpleDefense":
                title = `${game.i18n.localize("SR5.MatrixDefenseTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.matrixRolledActions[rollKey])}`;
                dicePool = matrixAction.defense.dicePool;
                typeSub = rollKey;
                optionalData = {
                    defenseFull: actorData.attributes?.willpower?.augmented.value || 0,
                }
            break;

            case "matrixDefense":
                if (actor.type === "actorSpirit") return;
                title = `${game.i18n.localize("SR5.MatrixDefenseTest")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.matrixRolledActions[rollKey])} (${chatData.test.hits})`;
                dicePool = matrixAction.defense.dicePool;
                typeSub = rollKey;

                optionalData = {
                    matrixActionType: matrixAction.limit.linkedAttribute,
                    overwatchScore: matrixAction.increaseOverwatchScore,
                    hits: chatData?.test.hits,
                    matrixActionAuthor: chatData?.matrixActionAuthor,
                    mark: chatData?.mark,
                    defenseFull: actorData.attributes?.willpower?.augmented.value || 0,
                }
                break;

            case "matrixResistance":
                //let resistance = rollKey.matrixResistanceType;
                title = `${game.i18n.localize("SR5.TakeOnDamageMatrix")} (${chatData.matrixDamageValue})`;
                dicePool = actorData.matrix.resistances[rollKey].dicePool;
                optionalData = {
                    chatActionType: "msgTest_damage",
                    matrixDamageValue: chatData.matrixDamageValue,
                    matrixDamageValueBase: chatData.matrixDamageValue,
                    damageType: chatData.damageType,
                    matrixActionAuthor: chatData.matrixActionAuthor,
                }
                break;

            case "resonanceAction":
                title = `${game.i18n.localize("SR5.ResonanceActionTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.resonanceActions[rollKey])}`;
                dicePool = resonanceAction.test.dicePool;
                limit = resonanceAction.limit?.value;
                typeSub = rollKey;
            
                optionalData = {
                    chatActionType: "msgTest_resonanceDefense",
                    matrixActionType: resonanceAction.limit?.linkedAttribute,
                    overwatchScore: resonanceAction.increaseOverwatchScore,
                    "dicePoolMod.matrixNoiseScene": sceneNoise,
                    "dicePoolMod.matrixNoiseReduction": actorData.matrix.attributes.noiseReduction.value,
                }
                break;

            case "defense":
                title = `${game.i18n.localize("SR5.PhysicalDefenseTest")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.characterDefenses[rollKey])}`;
                dicePool = actorData.defenses[rollKey].dicePool;
                if (rollKey !== "defend") limit = actorData.limits.physicalLimit.value;
                optionalData = {
                    cover: true,
                    defenseFull: actorData.attributes?.willpower?.augmented.value || 0,
                }
                break;

            case "fadingCard":
                title = game.i18n.localize("SR5.FadingResistanceTest");
                if (chatData.fadingValue >= 0) title += ` (${chatData.fadingValue})`;
                dicePool = actorData.matrix.resistances.fading.dicePool;
                if (chatData.hits > actorData.specialAttributes.resonance.augmented.value) chatData.fadingType = "physical";
                optionalData = {
                    chatActionType: "msgTest_damage",
                    fadingValue: chatData.fadingValue,
                    fadingType: chatData.fadingType,
                    actorResonance: chatData.actorResonance,
                    hits: chatData.hits,
                }
                break;
            
            case "drainCard":
                title = game.i18n.localize("SR5.DrainResistanceTest");
                if (chatData.drainValue >= 0) title += ` (${chatData.drainValue})`;
                dicePool = actorData.magic.drainResistance.dicePool;
                if (chatData.hits > actorData.specialAttributes.magic.augmented.value) chatData.drainType = "physical";
                optionalData = {
                    chatActionType: "msgTest_damage",
                    drainValue: chatData.drainValue,
                    drainType: chatData.drainType,
                    actorMagic: chatData.actorMagic,
                    hits: chatData.hits,
                }
                break;

            case "drain":
                title = game.i18n.localize("SR5.DrainResistanceTest");
                dicePool = actorData.magic.drainResistance.dicePool;
                break;

            case "defenseCard":
                if (actor.type === "actorDevice" || actor.type === "actorSprite") return;
                title = `${game.i18n.localize("SR5.PhysicalDefenseTest")} (${chatData.test.hits})`;
                dicePool = actorData.defenses.defend.dicePool;
                typeSub = chatData.typeSub;

                if (typeSub === "meleeWeapon"){
                    let reach = (actorData.reach?.value || 0) - chatData.attackerReach;
                    let weaponUsedToDefend = actor.items.find(i => (i.type === "itemWeapon") && (i.data.data.category === "meleeWeapon") && (i.data.data.isActive) );
                    if (weaponUsedToDefend) reach = weaponUsedToDefend.data.data.reach.value - chatData.attackerReach;
                    optionalData = mergeObject(optionalData, {
                        reach: reach,
                    });
                }  

                if (canvas.scene && chatData.type === "spell" && chatData.item.data.range === "area"){
                    // Spell position
                    let spellPosition = SR5_SystemHelpers.getTemplateItemPosition(chatData.item._id); 
                    // Get defenser position
                    let defenserPosition = SR5_EntityHelpers.getActorCanvasPosition(actor);
                    // Calcul distance between grenade and defenser
                    let distance = SR5_SystemHelpers.getDistanceBetweenTwoPoint(spellPosition, defenserPosition);
                    //modify the damage based on distance and damage dropoff.
                    if (chatData.spellArea < distance) {
                        ui.notifications.info(`${game.i18n.localize("SR5.INFO_TargetIsTooFar")}`);
                        return;
                    }
                }

                let cumulativeDefense = actor.getFlag("sr5", "cumulativeDefense");
                if(cumulativeDefense !== null) actor.setFlag("sr5", "cumulativeDefense", cumulativeDefense + 1);

                optionalData = mergeObject(optionalData, {
                    chatActionType: "msgTest_attackResistance",
                    damageElement: chatData.damageElement,
                    damageValue: chatData.damageValue,
                    damageValueBase: chatData.damageValue,
                    damageType: chatData.damageType,
                    incomingPA: chatData.incomingPA,
                    incomingFiringMode: chatData.firingModeDefenseMod,
                    cumulativeDefense: cumulativeDefense,
                    hits: chatData.test.hits,
                    cover: true,
                    defenseFull: actorData.attributes?.willpower?.augmented.value || 0,
                    "activeDefenses.dodge": actorData.skills?.gymnastics?.rating.value || 0,
                    "activeDefenses.block": actorData.skills?.unarmedCombat?.rating.value  || 0,
                    "activeDefenses.parryClubs": actorData.skills?.clubs?.rating.value  || 0,
                    "activeDefenses.parryBlades": actorData.skills?.blades?.rating.value  || 0
                });
                break;

            case "weapon":
                title = `${game.i18n.localize("SR5.AttackWith")} ${item.name}`;
                dicePool = itemData.weaponSkill.dicePool;
                limit = itemData.accuracy.value;
                let limitType = "accuracy";
                if (itemData.category === "grenade") {
                    limit = actorData.limits.physicalLimit.value;
                    limitType = "physicalLimit";
                }
                typeSub = itemData.category;
                testType = "opposedTest";
                rollType = "attack";

                // Recoil Compensation calculation
                let recoilCompensation = actorData.recoilCompensation.value;
                if (actor.data.type !== "actorDrone") recoilCompensation += itemData.recoilCompensation.value;
                let cumulativeRecoil = actor.getFlag("sr5", "cumulativeRecoil") || 0;
                recoilCompensation -= cumulativeRecoil;

                let rangeModifier = 0;
                // Get actor and target position and calcul range modifiers
                if (canvas.scene){
                    // Get attacker position
                    let attacker = SR5_EntityHelpers.getActorCanvasPosition(actor);
                    // Get target position
                    let target;
                    if (game.user.targets.size) {
                        const targeted = game.user.targets;
                        const targets = Array.from(targeted);
                        for (let t of targets) {
                            target = t._validPosition;
                        }
                    } else { target = 0;}
                    if (itemData.category === "grenade"|| itemData.type === "grenadeLauncher" || itemData.type === "missileLauncher") {
                        typeSub = "grenade";
                        target = SR5_SystemHelpers.getTemplateItemPosition(entity.id); 
                        optionalData = mergeObject(optionalData, {
                            "button.removeTemplate": true,
                        });
                    }
                    // Calcul distance between Attacker and Target
                    let distance = SR5_SystemHelpers.getDistanceBetweenTwoPoint(attacker, target);

                    if (itemData.category === "meleeWeapon") {
                        optionalData = mergeObject(optionalData, {attackerReach: itemData.reach.value,});
                        if (distance > (itemData.reach.value + 0.5)) ui.notifications.info(`${game.i18n.localize("SR5.INFO_TargetIsTooFar")}`);
                    } else { 
                        // Handle weapon ranged based on distance
                        if (distance < itemData.range.short.value) rangeModifier = 0;
                        else if (distance < itemData.range.medium.value) rangeModifier = -1;
                        else if (distance < itemData.range.long.value) rangeModifier = -3;
                        else if (distance < itemData.range.extreme.value) rangeModifier = -6;
                        else if (distance > itemData.range.extreme.value) {
                            if (itemData.category === "grenade"|| itemData.type === "grenadeLauncher" || itemData.type === "missileLauncher"){
                                SR5_RollMessage.removeTemplate(null, item.id)
                            }
                            ui.notifications.info(`${game.i18n.localize("SR5.INFO_TargetIsTooFar")}`);
                            return;
                        }
                    }
                }

                optionalData = mergeObject(optionalData, {
                    limiteType: limitType,
                    damageValue: itemData.damageValue.value,
                    damageValueBase: itemData.damageValue.value,
                    damageType: itemData.damageType,
                    damageElement: itemData.damageElement,
                    incomingPA: itemData.armorPenetration.value,
                    targetRange: rangeModifier,
                    rc: recoilCompensation,
                });
                break;

            case "spell":
                let spellCategory = itemData.category;
                typeSub = itemData.subCategory;
                title = `${game.i18n.localize("SR5.CastSpell")} ${item.name}`;
                dicePool = actorData.skills.spellcasting.spellCategory[spellCategory].dicePool;
                
                optionalData = {
                    "drainMod.spell": itemData.drainModifier,
                    drainType: "stun",
                    damageType: itemData.damageType,
                    damageElement: itemData.damageElement,
                    spellType: itemData.type,
                    limitType: "force",
                    force: actorData.specialAttributes.magic.augmented.value,
                    actorMagic: actorData.specialAttributes.magic.augmented.value,
                    "sceneData.backgroundCount": backgroundCount,
                    "sceneData.backgroundAlignement": backgroundAlignement,
                }
                if (itemData.range === "area"){
                    optionalData = mergeObject(optionalData, {
                        "button.placeTemplate": true,
                    });
                }
                break;

            case "preparation":
                title = `${game.i18n.localize("SR5.PreparationUse")}${game.i18n.localize("SR5.Colons")} ${item.name}`;
                dicePool = itemData.test.dicePool;
                limit = itemData.force;
                typeSub = itemData.subCategory;

                optionalData = {
                    damageType: itemData.damageType,
                    damageElement: itemData.damageElement,
                    spellType: itemData.type,
                    force: itemData.force,
                    "sceneData.backgroundCount" : backgroundCount,
                    "sceneData.backgroundAlignement": backgroundAlignement,
                }
                if (itemData.range === "area"){
                    optionalData = mergeObject(optionalData, {
                        "button.placeTemplate": true,
                    });
                }
                break;

            case "preparationFormula":
                title = `${game.i18n.localize("SR5.PreparationCreate")}${game.i18n.localize("SR5.Colons")} ${item.name}`;
                dicePool = actorData.skills.alchemy.test.dicePool;
                optionalData = {
                    "switch.specialization": true,
                    "drainMod.spell": itemData.drainModifier,
                    drainType: "stun",
                    force: actorData.specialAttributes.magic.augmented.value,
                    actorMagic: actorData.specialAttributes.magic.augmented.value,
                    "sceneData.backgroundCount": backgroundCount,
                    "sceneData.backgroundAlignement": backgroundAlignement,
                }
                break;

            case "complexForm":
                title = `${game.i18n.localize("SR5.Thread")} ${item.name}`;
                dicePool = actorData.matrix.resonanceActions.threadComplexForm.test.dicePool;                
                for (let e of itemData.systemEffects){
                    if (e.value === "sre_ResonanceSpike") typeSub = "resonanceSpike";
                }
                optionalData = {
                    fadingModifier: itemData.fadingModifier,
                    fadingType: "stun",
                    level: actorData.specialAttributes.resonance.augmented.value,
                    actorResonance: actorData.specialAttributes.resonance.augmented.value,
                    defenseAttribute: itemData.defenseAttribute,
                    defenseMatrixAttribute: itemData.defenseMatrixAttribute,
                    "dicePoolMod.matrixNoiseScene": sceneNoise,
                    "dicePoolMod.matrixNoiseReduction": actorData.matrix.attributes.noiseReduction.value,
                }
                break;
            
            case "complexFormDefense":
                title = `${game.i18n.localize("SR5.Defense")} ${game.i18n.localize("SR5.Against")} ${chatData.item.name} (${chatData.hits})`;
                let defenseAttribute;
                let defenseMatrixAttribute;

                if (actor.type === "actorSpirit"){
                    return;
                } else if (actor.type === "actorDevice" || actor.type === "actorSprite") {
                    defenseAttribute = actorData.matrix.deviceRating;
                    defenseMatrixAttribute = actorData.matrix.attributes[chatData.defenseMatrixAttribute].value;
                } else {
                    if (actorData.attributes[chatData.defenseAttribute]){
                        defenseAttribute = actorData.attributes[chatData.defenseAttribute].augmented.value;
                        defenseMatrixAttribute = actorData.matrix.attributes[chatData.defenseMatrixAttribute].value;
                    } else {
                        if (actor.type === "actorDrone" && actorData.slaved && actor.data.flags.sr5?.vehicleControler !== undefined) {
                            defenseAttribute = actor.data.flags.sr5.vehicleControler.data.attributes[chatData.defenseAttribute].augmented.value;
                            defenseMatrixAttribute = actor.data.flags.sr5.vehicleControler.data.matrix.attributes[chatData.defenseMatrixAttribute].value
                        } else {
                            defenseAttribute = actorData.matrix.deviceRating;
                            defenseMatrixAttribute = actorData.matrix.attributes[chatData.defenseMatrixAttribute].value;
                        }
                    }
                }
                dicePool = defenseAttribute + defenseMatrixAttribute;
                typeSub = chatData.typeSub;
                optionalData = {
                    hits: chatData.test.hits,
                    defenseFull: actorData.attributes?.willpower?.augmented.value || 0,
                }
                break;

            case "power":
                title = `${game.i18n.localize("SR5.UsePower")} ${item.name}`;
                dicePool = itemData.test.dicePool;
                if (itemData.defenseFirstAttribute && itemData.defenseSecondAttribute){
                    optionalData = {
                        defenseFirstAttribute: itemData.defenseFirstAttribute || 0,
                        defenseSecondAttribute: itemData.defenseSecondAttribute || 0,
                        "sceneData.backgroundCount": backgroundCount,
                        "sceneData.backgroundAlignement": backgroundAlignement,
                    }
                }
                break;

            case "powerDefense":
                if (actor.type === "actorDrone" || actor.type === "actorDevice" || actor.type === "actorSprite") return;
                title = `${game.i18n.localize("SR5.Defense")} ${game.i18n.localize("SR5.Against")} ${chatData.item.name}`;
                let firstAttribute, secondAttribute;
                if (chatData.defenseFirstAttribute === "edge" || chatData.defenseFirstAttribute === "magic" || chatData.defenseFirstAttribute === "resonance"){
                    firstAttribute = actorData.specialAttributes[chatData.defenseFirstAttribute].augmented.value;
                } else {
                    firstAttribute = actorData.attributes[chatData.defenseFirstAttribute].augmented.value;
                }
                if (chatData.defenseSecondAttribute === "edge" || chatData.defenseecondAttribute === "magic" || chatData.defenseSecondAttribute === "resonance"){
                    secondAttribute = actorData.specialAttributes[chatData.defenseSecondAttribute].augmented.value;
                } else {
                    secondAttribute = actorData.attributes[chatData.defenseSecondAttribute].augmented.value;
                }
                dicePool = firstAttribute + secondAttribute;
                optionalData = {
                    hits: chatData.test.hits,
                    defenseFull: actorData.attributes?.willpower?.augmented.value || 0,
                }
                break;
            
            case "spritePower":
                title = `${game.i18n.localize("SR5.UsePower")} ${item.name}`;
                dicePool = itemData.test.dicePool;
                limit = actorData.matrix.attributes[itemData.testLimit].value;
                optionalData = {
                    defenseAttribute: itemData.defenseAttribute,
                    defenseMatrixAttribute: itemData.defenseMatrixAttribute,
                }
                break;
            
            case "vehicleTest":
                title = `${game.i18n.localize("SR5.VehicleTest")}`;
                dicePool = actorData.vehicleTest.test.dicePool;
                limit = actorData.vehicleTest.limit.value;
                break;
            default:

        }
        //console.log(actor);
        //console.log(actor.toObject(false));
        let dialogData = {
            title: title,
            actor: actor.toObject(false),
            lists: actor.data.lists,
            speakerActor: speakerActor,
            speakerId: speakerId,
            speakerImg: speakerImg,
            dicePool: dicePool,
            dicePoolMod: {},
            limit: limit,
            limitMod: {},
            type: rollType,
            typeSub: typeSub,
            testType: testType,
            button: {},
        };

        if (item) {
            dialogData = mergeObject(dialogData, {
                item: item.toObject(false),
            });
        }

        mergeObject(dialogData, optionalData);
        SR5_Dice.prepareRollDialog(dialogData);
    }
}