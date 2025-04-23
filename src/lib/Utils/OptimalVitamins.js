/**
 * @class The AutomationUtilsOptimalVitamins class provides utilities for calculating and applying optimal vitamins to Pokémon.
 */
class AutomationUtilsOptimalVitamins {
    /**
     * @brief Calculates the breeding attack bonus based on vitamins used and base attack.
     *
     * @param {Object} vitaminsUsed - The vitamins used (Protein, Calcium, Carbos).
     * @param {number} baseAttack - The base attack of the Pokémon.
     * @returns {number} - The breeding attack bonus.
     */
    static getBreedingAttackBonus(vitaminsUsed, baseAttack) {
        const attackBonusPercent = (GameConstants.BREEDING_ATTACK_BONUS + vitaminsUsed.Calcium) / 100;
        const proteinBoost = vitaminsUsed.Protein;
        return (baseAttack * attackBonusPercent) + proteinBoost;
    }

    /**
     * @brief Calculates the egg steps required based on vitamins used and egg cycles.
     *
     * @param {Object} vitaminsUsed - The vitamins used (Protein, Calcium, Carbos).
     * @param {number} eggCycles - The base egg cycles of the Pokémon.
     * @returns {number} - The calculated egg steps.
     */
    static calcEggSteps(vitaminsUsed, eggCycles) {
        const div = 300;
        const extraCycles = (vitaminsUsed.Calcium + vitaminsUsed.Protein) / 2;
        const steps = (eggCycles + extraCycles) * GameConstants.EGG_CYCLE_MULTIPLIER;
        return steps <= div ? steps : Math.round(((steps / div) ** (1 - vitaminsUsed.Carbos / 70)) * div);
    }

    /**
     * @brief Calculates the efficiency of vitamins used for breeding.
     *
     * @param {Object} vitaminsUsed - The vitamins used (Protein, Calcium, Carbos).
     * @param {number} baseAttack - The base attack of the Pokémon.
     * @param {number} eggCycles - The base egg cycles of the Pokémon.
     * @returns {number} - The efficiency score.
     */
    static getEfficiency(vitaminsUsed, baseAttack, eggCycles) {
        return (this.getBreedingAttackBonus(vitaminsUsed, baseAttack) / this.calcEggSteps(vitaminsUsed, eggCycles)) * GameConstants.EGG_CYCLE_MULTIPLIER;
    }

    /**
     * @brief Determines the optimal combination of vitamins for a Pokémon based on its stats and region.
     *
     * @param {number} baseAttack - The base attack of the Pokémon.
     * @param {number} eggCycles - The base egg cycles of the Pokémon.
     * @param {number} region - The current region (used to determine vitamin availability).
     * @returns {Object} - The optimal combination of vitamins and their efficiency.
     */
    static getBestVitamins(baseAttack, eggCycles, region) {
        let res = {
            Protein: 0,
            Calcium: 0,
            Carbos: 0,
            Efficiency: this.getEfficiency({ Protein: 0, Calcium: 0, Carbos: 0 }, baseAttack, eggCycles),
        };

        const totalVitamins = (region + 1) * 5;
        const maxCarbos = region >= GameConstants.Region.unova ? totalVitamins : 0;

        for (let carbos = 0; carbos <= maxCarbos; carbos++) {
            const maxCalcium = region >= GameConstants.Region.hoenn ? totalVitamins - carbos : 0;
            for (let calcium = 0; calcium <= maxCalcium; calcium++) {
                const maxProtein = totalVitamins - (carbos + calcium);
                for (let protein = 0; protein <= maxProtein; protein++) {
                    const efficiency = this.getEfficiency({ Protein: protein, Calcium: calcium, Carbos: carbos }, baseAttack, eggCycles);
                    if (efficiency > res.Efficiency) {
                        res = {
                            Protein: protein,
                            Calcium: calcium,
                            Carbos: carbos,
                            Efficiency: efficiency,
                        };
                    }
                }
            }
        }

        return res;
    }
}
