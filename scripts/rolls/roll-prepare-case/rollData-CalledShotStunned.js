import { SR5_PrepareRollHelper } from "../roll-prepare-helpers.js";
import { SR5 } from "../../config.js";

export default function calledShotStunned(rollData, rollType, actor, chatData){
    let calledShotEffect = chatData.combat.calledShot.effects.find(e => e.name === rollType);

    //Determine title
    rollData.test.title = `${game.i18n.format('SR5.EffectResistanceTest', {effect: game.i18n.localize(SR5.calledShotsEffects[calledShotEffect.name])})} (${calledShotEffect.threshold})`;;

    //Determine dicepool composition
    rollData.dicePool.composition = ([
        {source: game.i18n.localize("SR5.Body"), type: "linkedAttribute", value: actor.system.attributes.body.augmented.value},
        {source: game.i18n.localize("SR5.Willpower"), type: "linkedAttribute", value: (actor.system.attributes.willpower.augmented.value)},
    ]);

    //Determine base dicepool
    rollData.dicePool.base = SR5_PrepareRollHelper.getBaseDicepool(rollData);

    //Add others informations
    rollData.test.type = "stunnedResistance";
    rollData.previousMessage.hits = chatData.roll.hits;

    return rollData;
}