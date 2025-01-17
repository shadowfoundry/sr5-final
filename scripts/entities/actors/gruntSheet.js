import { ActorSheetSR5 } from "./baseSheet.js";

/**
 * An Actor sheet for player character type actors in the Shadowrun 5 system.
 */
export class SR5GruntSheet extends ActorSheetSR5 {
	constructor(...args) {
		super(...args);

		this._shownUntrainedSkills = false;
		this._shownNonRollableMatrixActions = false;
		this._shownInactiveMatrixPrograms = true;
		this._shownUntrainedGroups = false;
		this._filters = {
			skills: "",
			matrixActions: "",
		};
	}

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			template: "systems/sr5/templates/actors/grunt-sheet.html",
			width: 800,
			height: 618,
			resizable: false,
			classes: ["sr5", "sheet", "actor", "grunt"],
		});
	}

	getData() {
		const actorData = this.actor.toObject(false);
		const context ={
			editable: this.isEditable,
			actor: actorData,
			system: actorData.system,
			items: actorData.items,
			owner: this.actor.isOwner,
			filters: this._filters,
			lists: actorData.system.lists,
		};

		// Sort Owned Items
		for ( let i of context.items ) {
			const item = this.actor.items.get(i._id);
			i.labels = item.labels;
		}
		context.items.sort((a, b) => (a.sort || 0) - (b.sort || 0));

		this._prepareItems(context.actor);
		this._prepareSkills(context.actor);
		this._prepareSkillGroups(context.actor);
		this._prepareMatrixActions(context.actor);

		if (game.settings.get("sr5", "sr5MatrixGridRules")) context.rulesMatrixGrid = true;
		else context.rulesMatrixGrid = false;
		if (game.settings.get("sr5", "sr5CalledShotsRules")) context.rulesCalledShot = true;
		else context.rulesCalledShot = false;
		if (game.settings.get("sr5", "sr5KillCodeRules")) context.rulesKillCode = true;
		else context.rulesKillCode = false;
		if (game.settings.get("sr5", "sr5Rigger5Actions")) context.matrixActionsRigger5 = true;
		else context.matrixActionsRigger5 = false;

		return context;
	}

	_prepareSkills(actor) {
		const activeSkills = {};
		for (let [key, skill] of Object.entries(actor.system.skills)) {
		if (skill.rating.value > 0 || this._shownUntrainedSkills)
			activeSkills[key] = skill;
		}
		actor.system.skills = activeSkills;
	}

	_prepareSkillGroups(actor) {
		const activeGroups = {};
		for (let [key, group] of Object.entries(actor.system.skillGroups)) {
		if (group.value > 0 || this._shownUntrainedGroups)
			activeGroups[key] = group;
		}
		actor.system.skillGroups = activeGroups;
	}

	_prepareMatrixActions(actor) {
		const activeMatrixActions = {};
		let hasAttack = (actor.system.matrix.attributes.attack.value > 0) ? true : false; 
		let hasSleaze = (actor.system.matrix.attributes.sleaze.value > 0) ? true : false; 
		let killCodeRules = game.settings.get("sr5", "sr5KillCodeRules");	
		let rigger5Actions = game.settings.get("sr5", "sr5Rigger5Actions");

		for (let [key, matrixAction] of Object.entries(actor.system.matrix.actions)) {
			let linkedAttribute = matrixAction.limit?.linkedAttribute;
			if ( (matrixAction.source === "core" || (killCodeRules && matrixAction.source === "killCode") || (rigger5Actions && matrixAction.source === "rigger5")) &&   (matrixAction.test?.dicePool >= 0 && (linkedAttribute === "attack" && hasAttack) )
			|| (matrixAction.test?.dicePool >= 0 && (linkedAttribute === "sleaze" && hasSleaze) )
			|| (matrixAction.test?.dicePool > 0 && (linkedAttribute === "firewall" || linkedAttribute === "dataProcessing" || linkedAttribute === "") )
			|| this._shownNonRollableMatrixActions) {
				activeMatrixActions[key] = matrixAction;
			}
		}
		actor.system.matrix.actions = activeMatrixActions;
	}

	_prepareItems(actor) {
		const knowledges = [];
		const languages = [];
		const weapons = [];
		const armors = [];
		const augmentations = [];
		const qualities = [];
		const spells = [];
		const focuses = [];
		const adeptPowers = [];
		const martialArts = [];
		const metamagics = [];
		const gears = [];
		const spirits = [];
		const cyberdecks = [];
		const programs = [];
		const vehicles = [];
		const vehiclesMod = [];
		const marks = [];
		const powers = [];
		const preparations = [];
		const complexForms = [];
		const sprites = [];
		const echoes = [];
		const ammunitions = [];
		const externalEffects = [];
		const traditions = [];
		const rituals = [];

		// Iterate through items, allocating to containers
		for (let i of actor.items) {
		if (i.type === "itemKnowledge") knowledges.push(i);
		else if (i.type === "itemLanguage") languages.push(i);
		else if (i.type === "itemQuality") qualities.push(i);
		else if (i.type === "itemSpell") spells.push(i);
		else if (i.type === "itemFocus") focuses.push(i);
		else if (i.type === "itemWeapon") weapons.push(i);
		else if (i.type === "itemArmor") armors.push(i);
		else if (i.type === "itemAugmentation") augmentations.push(i);
		else if (i.type === "itemAdeptPower") adeptPowers.push(i);
		else if (i.type === "itemMartialArt") martialArts.push(i);
		else if (i.type === "itemMetamagic") metamagics.push(i);
		else if (i.type === "itemGear") gears.push(i);
		else if (i.type === "itemSpirit") spirits.push(i);
		else if (i.type === "itemDevice") cyberdecks.push(i);
		else if (i.type === "itemProgram") {
			if (i.system.isActive === true || this._shownInactiveMatrixPrograms) programs.push(i);
		}
		else if (i.type === "itemVehicle") vehicles.push(i);
		else if (i.type === "itemVehicleMod") vehiclesMod.push(i);
		else if (i.type === "itemMark") marks.push(i);
		else if (i.type === "itemPower") powers.push(i);
		else if (i.type === "itemPreparation") preparations.push(i);
		else if (i.type === "itemComplexForm") complexForms.push(i);
		else if (i.type === "itemSprite") sprites.push(i);
		else if (i.type === "itemEcho") echoes.push(i);
		else if (i.type === "itemAmmunition") ammunitions.push(i);
		else if (i.type === "itemEffect") externalEffects.push(i);
		else if (i.type === "itemDrug") gears.push(i);
		else if (i.type === "itemTradition") traditions.push(i);
		else if (i.type === "itemRitual") rituals.push(i);
		}

		actor.knowledges = knowledges;
		actor.languages = languages;
		actor.weapons = weapons;
		actor.armors = armors;
		actor.augmentations = augmentations;
		actor.qualities = qualities;
		actor.spells = spells;
		actor.focuses = focuses;
		actor.adeptPowers = adeptPowers;
		actor.martialArts = martialArts;
		actor.metamagics = metamagics;
		actor.spirits = spirits;
		actor.gears = gears;
		actor.cyberdecks = cyberdecks;
		actor.programs = programs;
		actor.vehicles = vehicles;
		actor.vehiclesMod = vehiclesMod;
		actor.powers = powers;
		actor.preparations = preparations;
		actor.complexForms = complexForms;
		actor.sprites = sprites;
		actor.echoes = echoes;
		actor.ammunitions = ammunitions;
		actor.externalEffects = externalEffects;
		actor.traditions = traditions;
		actor.rituals = rituals;
	}

	activateListeners(html) {
		super.activateListeners(html);
	}

	/** @override */
	async _onDropItemCreate(item) {
		switch(item.type){
		case "itemTradition":
			for (let i of this.actor.items){
				if (i.type === "itemTradition") return ui.notifications.warn(game.i18n.localize('SR5.WARN_OnlyOneTradition'));
			}
			return super._onDropItemCreate(item);
		case "itemDevice":
			for (let i of this.actor.items){
				if (i.type === "itemDevice" && i.system.isActive) return super._onDropItemCreate(item);
			}
			item.system.isActive = true;
			return super._onDropItemCreate(item);
		case "itemArmor":
			for (let i of this.actor.items){
				if (i.type === "itemArmor" && i.system.isActive) return super._onDropItemCreate(item);
			}
			item.system.isActive = true;
			return super._onDropItemCreate(item);
		case "itemWeapon":
			for (let i of this.actor.items){
				if (i.type === "itemWeapon" && i.system.isActive && (i.system.category === item.system.category)) return super._onDropItemCreate(item);
			}
			item.system.isActive = true;
			return super._onDropItemCreate(item);
		case "itemFocus":
		case "itemAugmentation":
		case "itemQuality":
		case "itemEcho":
			item.system.isActive = true;
			return super._onDropItemCreate(item);
		case "itemAdeptPower":
		case "itemPower":
		case "itemMartialArt" :  
			if (item.system.actionType === "permanent") item.system.isActive = true;
			return super._onDropItemCreate(item);
		case "itemVehicleMod":
			return ui.notifications.info(game.i18n.localize('SR5.INFO_ForbiddenItemType'));
		default:
			return super._onDropItemCreate(item);
		}
	}
  
}
