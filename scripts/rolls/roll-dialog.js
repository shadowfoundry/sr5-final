import { SR5_EntityHelpers } from "../entities/helpers.js";
import { SR5_DiceHelper } from "./diceHelper.js";
import { SR5_SystemHelpers } from "../system/utility.js";
export default class SR5_RollDialog extends Dialog {

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            height: 'auto',
            width: 450,
            resizable: false,
        });
    }

    updateDicePoolValue(html) {
        let dicePoolModifier = 0;
        for (let value of Object.values(this.dicePoolModifier)){
            dicePoolModifier += value;
        }
        html.find('[name="dicePoolModifiers"]')[0].value = dicePoolModifier;
        let modifiedDicePool = dicePoolModifier + parseInt(html.find('[name="baseDicePool"]')[0].value);
        this.data.data.dicePoolBase = parseInt(html.find('[name="baseDicePool"]')[0].value);
        if (modifiedDicePool < 0) modifiedDicePool = 0;
        html.find('[data-button="roll"]')[0].innerHTML = `<i class="fas fa-dice-six"></i> ${game.i18n.localize("SR5.RollDice")} (${modifiedDicePool})`;
    }

    updateLimitValue(html) {
        if (html.find('[name="baseLimit"]')[0]){
            let modifiedLimit = parseInt(html.find('[name="baseLimit"]')[0].value)
            let limitModifier = 0;
            for (let [key, value] of Object.entries(this.limitModifier)){
                if (key === "reagents") modifiedLimit = value;
                else limitModifier += value;
            }
            modifiedLimit += limitModifier;
            if (modifiedLimit < 0) modifiedLimit = 0;
            html.find('[name="modifiedLimit"]')[0].value = modifiedLimit;
            this.data.data.limitBase = parseInt(html.find('[name="baseLimit"]')[0].value);
        }
    }

    updateDrainValue(html) {
        this.data.data.force = parseInt(html.find('[name="force"]')[0].value);
        if (html.find('[name="drainValue"]')[0]){
            let drainModifier = this.data.data.drainMod.spell;
            for (let value of Object.values(this.drainModifier)){
                drainModifier += value;
            }
            let drainFinalValue = parseInt(html.find('[name="force"]')[0].value) + drainModifier;
            if (drainFinalValue < 2) drainFinalValue = 2
            html.find('[name="drainValue"]')[0].value = drainFinalValue;
            this.data.data.drainValue = drainFinalValue;
        }
    }

    updateFadingValue(html) {
        this.data.data.level = parseInt(html.find('[name="level"]')[0].value);
        if (html.find('[name="fadingValue"]')[0]){
            let fadingModifier = this.data.data.fadingModifier;
            for (let value of Object.values(this.fadingModifier)){
                fadingModifier += value;
            }
            let fadingFinalValue = parseInt(html.find('[name="level"]')[0].value) + fadingModifier;
            if (fadingFinalValue < 2) fadingFinalValue = 2
            html.find('[name="fadingValue"]')[0].value = fadingFinalValue;
            this.data.data.fadingValue = fadingFinalValue;
        }
    }

    calculRecoil(html){
        let firingModeValue,
            actor = SR5_EntityHelpers.getRealActorFromID(this.data.data.actorId),
            item = actor.items.find(i => i.id === this.data.data.itemId);

        if (html.find('[data-modifier="firingMode"]')[0].value === "SS"){
            firingModeValue = 0;
            $(html).find(".hideBulletsRecoil").hide();
        } else firingModeValue = SR5_DiceHelper.convertModeToBullet(html.find('[data-modifier="firingMode"]')[0].value);

        this.data.data.firedAmmo = firingModeValue;
        html.find('[name="recoilBullets"]')[0].value = firingModeValue;
        html.find('[name="recoilCumulative"]')[0].value = actor.data.flags.sr5?.cumulativeRecoil || 0;
        if (item.data.data.recoilCompensation.value < 1) $(html).find(".hideWeaponRecoil").hide();
        if (actor.data.flags.sr5?.cumulativeRecoil < 1) $(html).find(".hideCumulativeRecoil").hide();

        let modifiedRecoil = this.data.data.rc - firingModeValue;
        if (modifiedRecoil > 0) modifiedRecoil = 0;
        return modifiedRecoil || 0;
    }

    async getTargetType(target){
        let item = await fromUuid(target);
        if (item.type === "itemSpell") return item.data.data.category;
        else return null;
    }

    activateListeners(html) {
        super.activateListeners(html);
        this.dicePoolModifier = {};
        this.limitModifier = {};
        this.drainModifier = {};
        this.fadingModifier = {};
        let actor = SR5_EntityHelpers.getRealActorFromID(this.data.data.actorId);
        let actorData = actor.data;
        let dialogData = this.data.data;

        this.updateDicePoolValue(html);
        this.updateLimitValue(html);

        //Hide some block on initial draw
        if (document.getElementById("extendedBlock")) document.getElementById("extendedBlock").style.display = "none";
        if (document.getElementById("useReagents")) document.getElementById("useReagents").style.display = "none";
        if (document.getElementById("reagentsModControl")) document.getElementById("reagentsModControl").style.display = "none";
        if (document.getElementById("sightPerception")) document.getElementById("sightPerception").style.display = "none";
        if (document.getElementById("matrixNoiseScene")) document.getElementById("matrixNoiseScene").style.display = "none";
        if (document.getElementById("matrixNoiseReduction")) document.getElementById("matrixNoiseReduction").style.display = "none";
        if (dialogData.type === "ritual") {
            document.getElementById("useReagents").style.display = "block";
            document.getElementById("reagentsModControl").style.display = "block";
        }

        //General commands for input
        html.find('.SR-ModInput').change(ev => this._manualInputModifier(ev, html, dialogData));
        //General commands for input buttons
        html.find('.SR-ModControl').click(ev => this._manualInputModifier(ev, html, dialogData, true));
        //General commands for input already filled by dialogData
        if (html.find('.SR-ModInputFilled')) this._filledInputModifier(document.getElementsByClassName("SR-ModInputFilled"), html, dialogData);
        //General commands for checkbox
        if (html.find('.SR-ModCheckboxFilled')) this._filledCheckBox(document.getElementsByClassName("SR-ModCheckboxFilled"), html, dialogData);
        html.find('.SR-ModCheckbox').change(ev => this._checkboxModifier(ev, html, dialogData));    
        //General commands for select
        html.find('.SR-ModSelect').change(ev => this._selectModifiers(ev, html, dialogData));
        //General commands for select already filled by dialogData
        if (html.find('.SR-ModSelectFilled')) this._filledSelectModifier(document.getElementsByClassName("SR-ModSelectFilled"), html, dialogData);
        //Manage Threshold
        html.find('.SR-ManageThreshold').change(ev => this._manageThreshold(ev, html, dialogData));
        if (html.find('.SR-ManageThreshold')) this._filledThreshold(document.getElementsByClassName("SR-ManageThreshold"), html, dialogData);

        // Reset Recoil
        html.find(".resetRecoil").click(ev => this._onResetRecoil(ev, html, dialogData, actorData));

        // Limit modifier
        html.find(".limitModifier").change(ev => this._addVariousLimitModifier(ev, html, dialogData));

        // Extended test
        html.find('[name="toggleExtendedTest"]').change(ev => this._onToggleExtendedTest(ev.target.checked, dialogData));

        //Set extended test for Astral Traking or Healing test
        if (dialogData.type === "astralTracking" || dialogData.type === "healing"){
            html.find('[name="toggleExtendedTest"]')[0].checked = true;
            dialogData.extendedTest = true;
            if (dialogData.typeSub === "physical"){
                html.find('[name="extendedTime"]')[0].value = "day";
            }
            this._onToggleExtendedTest(true, dialogData)
        }
    }


    //Add checkbox modifiers
    _checkboxModifier(ev, html, dialogData){
        let isChecked = ev.target.checked,
            target = $(ev.currentTarget).attr("data-target"),
            name = `[name=${target}]`,
            modifierName = $(ev.currentTarget).attr("data-modifier"),
            value = 0;

        let actor = SR5_EntityHelpers.getRealActorFromID(this.data.data.actorId);
        let actorData = actor.data;

        switch (modifierName){
            case "socialReputation":
                value = actorData.data.streetCred.value;
                break;
            case "workingFromMemory":
                if (actorData.data.attributes.logic.augmented.value >= 5) value = 0;
                else value = -(5 - actorData.data.attributes.logic.augmented.value);
                break;
            case "penalty":
                value = dialogData.penaltyValue;
                break;
            case "fullDefense":
                value = dialogData.defenseFull;
                break;
            case "reagents":
                if (isChecked) {
                    document.getElementById("useReagents").style.display = "block";
                    document.getElementById("reagentsModControl").style.display = "block";
                }
                else {
                    document.getElementById("useReagents").style.display = "none";
                    document.getElementById("reagentsModControl").style.display = "none";
                }
                return;
            case "recklessSpellcasting":
                if (isChecked) value = 3;
                html.find(name)[0].value = value;
                dialogData.drainMod.recklessSpellcasting = value;
                this.drainModifier.recklessSpellcasting = value;
                this.updateDrainValue(html);
                return;
            case "spiritAid":
                value = dialogData.spiritAidMod;
                break;
            case "centering":
                value = actorData.data.magic.metamagics.centeringValue.value;
                break;
            case "restraintReinforced":
                if (isChecked) value = 1;
                html.find(name)[0].value = value;
                let threshold = parseInt(html.find('[name="restraintThreshold"]')[0].value);
                dialogData.threshold = threshold + 1;
                return;
            case "specificallyLooking":
                value = 3;
                break;
            case "escapeSituationPicks":
            case "specialization":
            case "standsOutInSomeWay":
            case "camping":
            case "socialAce":
            case "socialRomantic":
            case "socialOutnumber":
            case "socialWieldingWeapon":
            case "socialTorture":
            case "socialObliviousToDanger":
            case "socialFan":
            case "socialBlackmailed":
                value = 2;
                break;
            case "controlAvailable":
            case "socialIsDistracted":
            case "socialAuthority":
                value = 1;
                break;
            case "socialIsDistractedInverse":
            case "socialIntoxicated":
            case "socialEvaluateSituation":
                value = -1;
                break;
            case "escapeSituationWatched":
            case "patientAwakenedOrEmerged":
            case "patientCooperation":
            case "distracted":
            case "notInImmediateVicinity":
            case "interfering":
            case "noFoundOrWater":
            case "socialBadLook":
            case "socialNervous":
            case "socialOutnumberTarget":
            case "socialWieldingWeaponTarget":
            case "socialLacksKnowledge":
                value = -2;
                break;
            case "farAway":
                value = -3;
                break;
        }

        if (isChecked){
            html.find(name)[0].value = value;
            dialogData.dicePoolMod[modifierName] = value;
            this.dicePoolModifier[modifierName] = value;
            this.updateDicePoolValue(html);
        } else {
            html.find(name)[0].value = 0;
            dialogData.dicePoolMod[modifierName] = 0;
            this.dicePoolModifier[modifierName] = 0;
            this.updateDicePoolValue(html);
        }
    }

    //Auto check checkbox modifiers
    _filledCheckBox(checkboxs, html, dialogData){
        if (checkboxs.length === 0) return;
        let checkboxName, modifierName, inputName, value;

        let actor = SR5_EntityHelpers.getRealActorFromID(this.data.data.actorId),
        actorData = actor.data;

        for (let e of checkboxs){
            modifierName = $(e).attr("data-modifier");
            checkboxName = `[data-modifier=${modifierName}]`;
            inputName = `[name=${$(e).attr("data-target")}]`;

            switch (modifierName){
                case "patientAwakenedOrEmerged":
                    if (dialogData.isEmergedOrAwakened){
                        html.find(checkboxName)[0].checked = true;
                        value = -2;
                    }
                    break;
                case "fullDefense":
                    let fullDefenseEffect = actorData.effects.find(e => e.data.origin === "fullDefense");
		            let isInFullDefense = (fullDefenseEffect) ? true : false;
                    if (isInFullDefense){
                        html.find(checkboxName)[0].checked = true;
                        value = dialogData.defenseFull;
                    }
                    break;
            }
        }

        if (html.find(checkboxName)[0].checked){
            html.find(inputName)[0].value = value;
            dialogData.dicePoolMod[modifierName] = value;
            this.dicePoolModifier[modifierName] = value;
            this.updateDicePoolValue(html);
        }
    }

    //Manage manual input modifier
    _manualInputModifier(ev, html, dialogData, button = false){
        let target, name, modifierName, value, operator;
        let actor = SR5_EntityHelpers.getRealActorFromID(this.data.data.actorId),
        actorData = actor.data;

        if (button){ //Manage plus minus input
            target = $(ev.currentTarget).attr("data-target");
            operator = $(ev.currentTarget).attr("data-type");
            modifierName = $(ev.currentTarget).attr("data-modifier");
            name = `[name=${target}]`;
            value = html.find(name)[0].value;
            if (operator === "plus"){
                value++;
                html.find(name)[0].value = value;
            } else {
                value--;
                html.find(name)[0].value = value;
            }
        } else {
            target = $(ev.currentTarget).attr("name");
            name = `[name=${target}]`;
            modifierName = $(ev.currentTarget).attr("data-modifier");
            value = parseInt(ev.target.value);
        }

        switch (target){
            case "force":
                this.updateDrainValue(html);
                if (dialogData.type === "ritual") this._updateReagents(value, actorData, html, dialogData);
                return;
            case "reagentsSpent":
                this._updateReagents(value, actorData, html, dialogData);
                return;
            case "level":
                this.updateFadingValue(html)
                return;
            case "dicePoolModSpellShaping":
                if (value > 0) {
                    ui.notifications.warn(game.i18n.format('SR5.WARN_SpellShapingMin'));
                    value = 0;
                } else if (-value > actorData.data.magic.metamagics.spellShapingValue.value){
                    value = -actorData.data.magic.metamagics.spellShapingValue.value;
                    ui.notifications.warn(game.i18n.format('SR5.WARN_SpellShapingMaxMagic', {magic: value}));
                }
                dialogData.spellAreaMod = -value;
                break;
            case "manaBarrierRating":
                let barrierRating = parseInt((html.find('[name="manaBarrierRating"]')[0].value || 1));
                html.find('[name="baseDicePool"]')[0].value = barrierRating * 2;
                this.data.data.dicePool = barrierRating * 2;
                this.updateDicePoolValue(html);
                return;
            case "patientEssence":
                dialogData.patientEssence = value;
                let essence = 6 - Math.ceil(dialogData.patientEssence);
                value = -Math.floor(essence/2);
                html.find('[name="dicePoolModPatientEssence"]')[0].value = value;
                dialogData.dicePoolMod.patientEssence = value;
                this.dicePoolModifier.patientEssence = value;
                this.updateDicePoolValue(html);
                return;
        }

        html.find(name)[0].value = value;
        dialogData.dicePoolMod[modifierName] = value;
        this.dicePoolModifier[modifierName] = value;
        this.updateDicePoolValue(html);
    }

    _filledInputModifier(ev, html, dialogData){
        if (ev.length === 0) return;
        let modifierName, name, value;
        let actor = SR5_EntityHelpers.getRealActorFromID(this.data.data.actorId),
            actorData = actor.data;

        for (let e of ev){
            modifierName = $(e).attr("data-modifier");
            name = `[data-modifier=${modifierName}]`;

            switch (modifierName){
                case "matrixNoiseReduction":
                    if (html.find('[data-modifier="matrixRange"]')[0].value === "wired") {
                        this.dicePoolModifier.matrixNoiseReduction = 0;
                        value = 0;
                    }
                    else {
                        let rangeMod = this.dicePoolModifier.matrixRange || 0,
                            sceneNoise = this.dicePoolModifier.matrixSceneNoise || 0;
                        value = actorData.data.matrix.attributes.noiseReduction.value;
                        if (-value < rangeMod + sceneNoise) value = -(rangeMod + sceneNoise);
                        if (rangeMod + sceneNoise === 0) value = 0;
                    }
                    break;
                case "matrixSceneNoise":
                    if (html.find('[data-modifier="matrixRange"]')[0].value !== "wired") value = dialogData.matrixNoiseScene;
                    else value = 0;
                    break;
                case "incomingPA":
                case "armor":
                    if (modifierName === "incomingPA"){
                        let armorValue = parseInt((html.find('[data-modifier="armor"]')[0].value || 0));
                        let incomingAP = parseInt((html.find('[data-modifier="incomingPA"]')[0].value || 0))
                        if (armorValue >= -incomingAP) value = incomingAP;
                        else {
                            let usedAP = armorValue + incomingAP;
                            value = incomingAP - usedAP;
                        }
                        this.dicePoolModifier.incomingPA = value;
                        html.find('[data-modifier="incomingPA"]')[0].value = value;
                        this.updateDicePoolValue(html);
                    }
                    return;
                case "publicGrid":
                    if (html.find('[data-modifier="matrixRange"]')[0].value !== "wired" && game.settings.get("sr5", "sr5MatrixGridRules")) value = -2;
                    else value = 0;
                    break;
                case "force":
                    this.updateDrainValue(html);
                    if (dialogData.type === "ritual") this._updateReagents(1, actorData, html, dialogData);
                    return;
                case "level":
                    this.updateFadingValue(html)
                    return;
                case "spiritType":
                    if (dialogData.targetActor && dialogData.typeSub === "binding"){
                        let targetActor = SR5_EntityHelpers.getRealActorFromID(dialogData.targetActor)
                        let targetType = targetActor.data.data.type;
                        value = actorData.data.skills.binding.spiritType[targetType].dicePool - actorData.data.skills.binding.test.dicePool;
                    } else {
                        value = 0;
                    }
                    break;
                case "patientEssence":
                    dialogData.patientEssence = (dialogData.targetEssence ? dialogData.targetEssence : 6);
                    html.find('[name="patientEssence"]')[0].value = dialogData.patientEssence;
                    let essence = 6 - Math.ceil(dialogData.patientEssence);
                    value = -Math.floor(essence/2);
                    html.find('[name="dicePoolModPatientEssence"]')[0].value = value;
                    dialogData.dicePoolMod.patientEssence = value;
                    this.dicePoolModifier.patientEssence = value;
                    this.updateDicePoolValue(html);
                    return;
                default:
                    value = parseInt((html.find(name)[0].value || 0));
            }

            html.find(name)[0].value = value;
            dialogData.dicePoolMod[modifierName] = value;
            this.dicePoolModifier[modifierName] = value;
            this.updateDicePoolValue(html);
        }
    }

    //Select modifiers
    async _selectModifiers(ev, html, dialogData){
        let target = $(ev.currentTarget).attr("data-target"),
            name = `[name=${target}]`,
            modifierName = $(ev.currentTarget).attr("data-modifier"),
            value,
            actor = SR5_EntityHelpers.getRealActorFromID(this.data.data.actorId),
            actorData = actor.data,
            position = this.position;

        position.height = "auto";

        if (ev === null) value = 0;
        else {
            switch (modifierName){
                case "weather":
                    value = SR5_DiceHelper.convertWeatherModifierToMod(ev.target.value);
                    break;
                case "socialAttitude":
                    value = SR5_DiceHelper.convertSocialAttitudeValueToMod(ev.target.value);
                    break;
                case "socialResult":
                    value = SR5_DiceHelper.convertSocialResultValueToMod(ev.target.value);
                    break;
                case "workingCondition":
                    value = SR5_DiceHelper.convertWorkingConditionToMod(ev.target.value);
                    break;
                case "toolsAndParts":
                    value = SR5_DiceHelper.convertToolsAndPartsToMod(ev.target.value);
                    break;
                case "plansMaterial":
                    value = SR5_DiceHelper.convertPlansMaterialToMod(ev.target.value);
                    break;
                case "attribute":
                    value = SR5_DiceHelper.getAttributeValue(ev.target.value, actorData);
                    break;
                case "incomingFiringMode":
                    value = SR5_DiceHelper.convertFiringModeToDefenseDicepoolMod(ev.target.value);
                    break;
                case "targetRange":
                    let baseRange = SR5_DiceHelper.convertRangeToEnvironmentalLine(ev.target.value);
                    baseRange += actorData.data.itemsProperties.environmentalMod.range.value;
                    value = SR5_DiceHelper.convertEnvironmentalModToDicePoolMod(baseRange);
                    break;
                case "firingMode":
                    value = this.calculRecoil(html);
                    modifierName = "recoil";
                    break;
                case "defenseMode":
                    value = SR5_DiceHelper.convertActiveDefenseToMod(ev.target.value, dialogData.activeDefenses);
                    break;
                case "cover":
                    value = SR5_DiceHelper.convertCoverToMod(ev.target.value);
                    break
                case "mark":
                    value = SR5_DiceHelper.convertMarkToMod(ev.target.value);
                    break;
                case "matrixRange":
                    value = SR5_DiceHelper.convertMatrixDistanceToDiceMod(ev.target.value);
                    if (ev.target.value !== "wired") {
                        if (document.getElementById("matrixNoiseScene")) document.getElementById("matrixNoiseScene").style.display = "block";
                        if (document.getElementById("matrixNoiseReduction")) document.getElementById("matrixNoiseReduction").style.display = "block";
                    }
                    else {
                        if (document.getElementById("matrixNoiseScene")) document.getElementById("matrixNoiseScene").style.display = "none";
                        if (document.getElementById("matrixNoiseReduction")) document.getElementById("matrixNoiseReduction").style.display = "none";
                    }
                    dialogData.matrixNoiseRange = ev.target.value;
                    this.setPosition(position);
                    break;
                case "targetGrid":
                    if (ev.target.value !== actorData.data.matrix.userGrid && ev.target.value !== "none") value = -2
                    else value = 0;
                    break;
                case "spriteType":
                    dialogData.spriteType = ev.target.value;
                    return;
                case "spiritType":
                    if (ev.target.value !== ""){
                        value = actorData.data.skills.summoning.spiritType[ev.target.value].dicePool - actorData.data.skills.summoning.test.dicePool;
                        dialogData.spiritType = ev.target.value;
                    } else value = 0;
                    break;
                case "preparationTrigger":
                    value = SR5_DiceHelper.convertTriggerToMod(ev.target.value);
                    html.find(name)[0].value = value;
                    dialogData.drainMod.trigger = value;
                    dialogData.preparationTrigger = ev.target.value;
                    this.drainModifier.preparationTrigger = value;
                    this.updateDrainValue(html);
                    return;
                case "perceptionType":
                    let limitMod = 0;
                    value = 0;
                    if (ev.target.value !== ""){
                        value = actorData.data.skills.perception.perceptionType[ev.target.value].test.value;
                        limitMod = actorData.data.skills.perception.perceptionType[ev.target.value].limit.value;
                    }
                    if (ev.target.value === "sight") {
                        document.getElementById("sightPerception").style.display = "block";
                        this.setPosition(position);
                        if (canvas.scene) dialogData.dicePoolMod.environmentalSceneMod = SR5_DiceHelper.handleEnvironmentalModifiers(game.scenes.active, actorData.data, true);
                        html.find('[data-modifier="environmentalSceneMod"]')[0].value = dialogData.dicePoolMod.environmentalSceneMod;
                        this.dicePoolModifier.environmental = dialogData.dicePoolMod.environmentalSceneMod;
                    } else {
                        document.getElementById("sightPerception").style.display = "none";
                        this.setPosition(position);
                        dialogData.dicePoolMod.environmentalSceneMod = 0;
                        this.dicePoolModifier.environmental = 0;
                    }
                    dialogData.perceptionType = ev.target.value;
                    dialogData.limitMod.perception = limitMod;
                    this.limitModifier.perceptionType = limitMod;
                    html.find('[name="limitModPerception"]')[0].value = limitMod;
                    this.updateLimitValue(html);
                    break;
                case "signatureSize":
                    value = SR5_DiceHelper.convertSignatureToDicePoolMod(ev.target.value);
                    dialogData.signatureType = ev.target.value;
                    break;
                case "searchType":
                    value = SR5_DiceHelper.convertSearchTypeToThreshold(ev.target.value);
                    dialogData.threshold = value;
                    dialogData.thresholdType = ev.target.value;
                    html.find(name)[0].value = value;
                    return;
                case "damageType":
                    dialogData.damageType = ev.target.value;
                    return;
                case "healingCondition":
                    value = SR5_DiceHelper.convertHealingConditionToDiceMod(ev.target.value);        
                    dialogData.healingCondition = ev.target.value;
                    break;
                case "healingSupplies":
                    dialogData.limitMod.healingSupplies = 0;
                    this.limitModifier.healingSupplies = 0;
                    html.find('[name="limitModHealingSupplies"]')[0].value = 0;
                    switch(ev.target.value){
                        case "noSupplies":
                            value = -3;
                            break;
                        case "improvised":
                            value = -1;
                            break;
                        case "medkit":
                            let medkit = SR5_DiceHelper.findMedkitRating(actor);
                            if (medkit){
                                value = medkit.rating;
                                dialogData.itemId = medkit.id;
                                dialogData.limitMod.healingSupplies = medkit.rating;
                                this.limitModifier.healingSupplies = medkit.rating;
                                html.find('[name="limitModHealingSupplies"]')[0].value = medkit.rating;
                            } else {
                                ui.notifications.warn(game.i18n.format('SR5.WARN_NoMedkit'));
                                value = 0;
                            }
                            this.updateLimitValue(html);
                            break;
                        default:
                            value = 0;
                    }
                    break;
                case "speedRammingAttacker":                
                    value = SR5_DiceHelper.convertSpeedToDamageValue(ev.target.value, actorData.data.attributes.body.augmented.value);
                    dialogData.damageValue = value;
                    html.find('[name="modifiedDamage"]')[0].value = value;
                    return;
                case "speedRammingTarget":
                    value = SR5_DiceHelper.convertSpeedToAccidentValue(ev.target.value, dialogData.target);
                    dialogData.accidentValue = value;
                    html.find(name)[0].value = value;
                    return;
                case "targetEffect":
                    dialogData.targetEffect = ev.target.value;
                    if (dialogData.typeSub === "counterspelling"){
                        let spellCategory = await this.getTargetType(dialogData.targetEffect);
                        value = parseInt(actorData.data.skills.counterspelling.spellCategory[spellCategory].dicePool - actorData.data.skills.counterspelling.test.dicePool);
                    } else value = 0;
                    break;
                case "objectType":
                    html.find('[name="baseDicePool"]')[0].value = parseInt(ev.target.value);
                    this.updateDicePoolValue(html);
                    return;
                default : value = ev.target.value;
            }
        }

        html.find(name)[0].value = value;
        dialogData.dicePoolMod[modifierName] = value;
        this.dicePoolModifier[modifierName] = value;
        this.updateDicePoolValue(html);
        if (modifierName === "matrixRange") this._filledInputModifier(document.getElementsByClassName("SR-ModInputFilled"), html, dialogData);
    }

    async _filledSelectModifier(ev, html, dialogData){
        if (ev.length === 0) return;
        let modifierName, targetInput, targetInputName, name, inputValue, selectValue;
        let actor = SR5_EntityHelpers.getRealActorFromID(this.data.data.actorId),
            actorData = actor.data;

        for (let e of ev){
            modifierName = $(e).attr("data-modifier");
            targetInput = $(e).attr("data-target");
            targetInputName = `[name=${targetInput}]`;
            name = `[data-modifier=${modifierName}]`;

            switch (modifierName){
                case "incomingFiringMode":
                    selectValue = dialogData.firingMode;
                    inputValue = SR5_DiceHelper.convertFiringModeToDefenseDicepoolMod(selectValue);
                    break;
                case "targetRange":
                    selectValue = dialogData.targetRange;
                    let baseRange = SR5_DiceHelper.convertRangeToEnvironmentalLine(dialogData.targetRange);
                    baseRange += actorData.data.itemsProperties.environmentalMod.range.value;
                    inputValue = SR5_DiceHelper.convertEnvironmentalModToDicePoolMod(baseRange);
                    break;
                case "firingMode":
                    inputValue = this.calculRecoil(html);
                    selectValue = null;
                    modifierName = "recoil";
                    break;
                case "spiritType":
                    selectValue = html.find(name)[0].value;
                    inputValue = actorData.data.skills.summoning.spiritType[selectValue].dicePool - actorData.data.skills.summoning.test.dicePool;
                    dialogData.spiritType = selectValue;
                    break;
                case "preparationTrigger":
                    inputValue = SR5_DiceHelper.convertTriggerToMod(html.find('[data-modifier="preparationTrigger"]')[0].value);
                    dialogData.drainMod.trigger = inputValue;
                    dialogData.preparationTrigger = html.find('[data-modifier="preparationTrigger"]')[0].value;
                    this.drainModifier.preparationTrigger = inputValue;
                    this.updateDrainValue(html);
                    return;
                case "searchType":
                    selectValue = html.find(name)[0].value;
                    inputValue = SR5_DiceHelper.convertSearchTypeToThreshold(selectValue);
                    dialogData.threshold = inputValue;
                    dialogData.thresholdType = selectValue;
                    html.find(targetInputName)[0].value = inputValue;
                    return;
                case "damageType":
                    dialogData.damageType = html.find(name)[0].value;
                    return;
                case "socialResult":
                case "socialAttitude":
                    inputValue = 0;
                    break;
                case "speedRammingAttacker":
                    selectValue = SR5_DiceHelper.convertSpeedToDamageValue(html.find(name)[0].value, actorData.data.attributes.body.augmented.value);
                    dialogData.damageValue = selectValue;
                    html.find('[name="modifiedDamage"]')[0].value = selectValue;
                    return;
                case "speedRammingTarget":
                    selectValue = SR5_DiceHelper.convertSpeedToAccidentValue(html.find(name)[0].value, dialogData.target);
                    dialogData.accidentValue = selectValue;
                    html.find(targetInputName)[0].value = value;
                    return;
                case "targetEffect":
                    selectValue = html.find(name)[0].value;
                    dialogData.targetEffect = selectValue;
                    if (dialogData.typeSub === "counterspelling"){
                        let spellCategory = await this.getTargetType(dialogData.targetEffect);
                        inputValue = parseInt(actorData.data.skills.counterspelling.spellCategory[spellCategory].dicePool - actorData.data.skills.counterspelling.test.dicePool);
                    } else inputValue = 0;
                    break;
            }

            html.find(targetInputName)[0].value = inputValue;
            if (selectValue) html.find(name)[0].value = selectValue;
            dialogData.dicePoolMod[modifierName] = inputValue;
            this.dicePoolModifier[modifierName] = inputValue;
            this.updateDicePoolValue(html);
        }
    }

    //Manage auto filled threhsold
    _filledThreshold(ev, html, dialogData){
        if (ev.length === 0) return;
        let targetInput, name, value, label;

        for (let e of ev){
            targetInput = $(e).attr("data-target");

            if (targetInput === "survivalThreshold") {
                value = 1;
                label = "mild";
            } else if (targetInput === "restraintThreshold"){
                value = 2;
                label = "rope";
            } else if (targetInput === "perceptionThreshold"){
                value = 0;
                label = "opposed";
            }
        }

        name = `[name=${targetInput}]`;
        html.find(name)[0].value = value;
        dialogData.threshold = value;
        dialogData.thresholdType = label;
    }

    //Manage threhsold
    _manageThreshold(ev, html, dialogData){
        let value, label;
        let targetInput = $(ev.currentTarget).attr("data-target");
        
        label = ev.target.value;
        value = ev.target.value;
        if (targetInput === "survivalThreshold") value = SR5_DiceHelper.convertSurvivalThresholdTypeToThreshold(ev.target.value);
        else if (targetInput === "restraintThreshold") value = SR5_DiceHelper.convertRestraintTypeToThreshold(ev.target.value);
        else if (targetInput === "perceptionThreshold") value = SR5_DiceHelper.convertPerceptionTypeToThreshold(ev.target.value);

        let name = `[name=${targetInput}]`;
        html.find(name)[0].value = value;
        dialogData.threshold = value;
        dialogData.thresholdType = label;
    }

    _updateReagents(value, actorData, html, dialogData){
        if (value > actorData.data.magic.reagents){
            value = actorData.data.magic.reagents;
            ui.notifications.warn(game.i18n.format('SR5.WARN_MaxReagents', {reagents: value}));
            if (dialogData.type === "ritual") html.find('[name="force"]')[0].value = value;
        }
        html.find('[data-modifier="reagents"]')[0].checked = true;
        html.find('[name="reagentsSpent"]')[0].value = value;
        dialogData.reagentsUsed = true;
        if (dialogData.type !== "ritual"){
            this.limitModifier.reagents = value;
            this.updateLimitValue(html);
        }
    }

    //Add full defense modifier on dialog start
    _addFullDefenseModifierOnStart(html, dialogData, actorData){
        let fullDefenseEffect = actorData.effects.find(e => e.data.origin === "fullDefense");
		let isInFullDefense = (fullDefenseEffect) ? true : false;
        if (isInFullDefense){
            html.find('[data-modifier="fullDefense"]')[0].checked = true;
            html.find('[name="dicePoolModFullDefense"]')[0].value = dialogData.defenseFull;
            dialogData.dicePoolMod.fullDefense = dialogData.defenseFull;
            this.dicePoolModifier.fullDefense = dialogData.defenseFull;
            this.updateDicePoolValue(html);
        }
    }

    //Toggle reset recoil
    _onResetRecoil(ev, html, dialogData, actorData){
        ev.preventDefault();
        let resetedActor = SR5_EntityHelpers.getRealActorFromID(actorData._id)
        resetedActor.resetRecoil();
        dialogData.rc += actorData.flags.sr5.cumulativeRecoil;
        dialogData.dicePoolMod.recoil = 0;
        actorData.flags.sr5.cumulativeRecoil = 0;
        let recoil = this.calculRecoil(html);
        html.find('[name="recoil"]')[0].value = recoil;
        this.dicePoolModifier.recoil = recoil;
        this.updateDicePoolValue(html);
    }

    //Add various limit modifiers
    _addVariousLimitModifier(ev, html, dialogData){
        html.find('[name="limitModVarious"]')[0].value = (parseInt(ev.target.value) || 0);
        dialogData.limitMod.various = (parseInt(ev.target.value) || 0);
        this.limitModifier.variousModifier = (parseInt(ev.target.value) || 0);
        this.updateLimitValue(html);
    }

    //Handle Extended Test
    _onToggleExtendedTest(isChecked, dialogData){
        //let isChecked = ev.target.checked;
        let position = this.position;
        position.height = "auto";    

        if (isChecked) {
            dialogData.extendedTest = true;
            document.getElementById("extendedBlock").style.display = "block";
            this.setPosition(position);
        }
        else {
            dialogData.extendedTest = false;
            document.getElementById("extendedBlock").style.display = "none";
            this.setPosition(position);
        }
    }

}