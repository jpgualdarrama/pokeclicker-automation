class AutomationVitamins {
    static Settings = {
        FeatureEnabled: "Vitamins-Enabled",
    };

    /**
     * @brief Initializes the Vitamins automation feature.
     *
     * @param {number} initStep - The current automation initialization step.
     */
    static initialize(initStep) {
        if (initStep === Automation.InitSteps.BuildMenu) {
            this.__internal__buildMenu();
        }
    }

    /*********************************************************************\
    |***    Internal members, should never be used by other classes    ***|
    \*********************************************************************/

    static __internal__autoVitaminsLoop = null;

    /**
     * @brief Builds the menu for the Vitamins automation feature.
     */
    static __internal__buildMenu() {
        const filtersDiv = document.getElementById("multivitamin-filters");
        if (!filtersDiv || !filtersDiv.parentElement) {
            console.error("Could not find the appropriate div to append the button.");
            return;
        }

        const applyVitaminsButton = document.createElement("button");
        applyVitaminsButton.textContent = "Apply Optimal Vitamins";
        applyVitaminsButton.style.margin = "10px";
        applyVitaminsButton.onclick = this.__internal__applyOptimalVitamins.bind(this);

        filtersDiv.parentElement.appendChild(applyVitaminsButton);
    }

    /**
     * @brief Applies optimal vitamins to the currently visible Pokémon in the modal.
     */
    static __internal__applyOptimalVitamins() {
        const visiblePokemon = this.__internal__getVisiblePokemon();

        visiblePokemon.forEach(pokemon => {
            const optimalVitamins = Automation.Utils.OptimalVitamins.getBestVitamins(
                pokemon.baseAttack,
                pokemon.eggCycles,
                player.highestRegion()
            );

            this.__internal__applyVitamins(pokemon, optimalVitamins);
        });
    }

    /**
     * @brief Retrieves the currently visible Pokémon in the modal.
     *
     * @returns {Array} List of visible Pokémon objects.
     */
    static __internal__getVisiblePokemon() {
        // Use PartyController to get the sorted list of Pokémon for vitamins
        return PartyController.getVitaminSortedList();
    }

    /**
     * @brief Applies vitamins to a Pokémon based on the provided object structure.
     *
     * @param {Object} pkmn - The Pokémon to apply vitamins to.
     * @param {Object} vitamins - The optimal vitamins to apply.
     */
    static __internal__applyVitamins(pkmn, vitamins) {
        const currentCarbos   = pkmn.vitaminsUsed[GameConstants.VitaminType.Carbos]();
        const currentCalcium  = pkmn.vitaminsUsed[GameConstants.VitaminType.Calcium]();
        const currentProtein  = pkmn.vitaminsUsed[GameConstants.VitaminType.Protein]();

        const deltaCarbos  = currentCarbos - vitamins.Carbos;
        const deltaCalcium = currentCalcium - vitamins.Calcium;
        const deltaProtein = currentProtein - vitamins.Protein;

        if(deltaCarbos > 0) {
            pkmn.removeVitamin(GameConstants.VitaminType.Carbos, deltaCarbos);
        }
        else if (deltaCarbos < 0
                 && player.itemList.Carbos() > 0) {
            pkmn.useVitamin(GameConstants.VitaminType.Carbos, -deltaCarbos);
        }

        if(deltaCalcium > 0) {
            pkmn.removeVitamin(GameConstants.VitaminType.Calcium, deltaCalcium);
        }
        else if (deltaCalcium < 0
                 && player.itemList.Calcium() > 0) {
            pkmn.useVitamin(GameConstants.VitaminType.Calcium, -deltaCalcium);
        }
        if(deltaProtein > 0) {
            pkmn.removeVitamin(GameConstants.VitaminType.Protein, deltaProtein);
        }
        else if (deltaProtein < 0
                 && player.itemList.Protein() > 0) {
            pkmn.useVitamin(GameConstants.VitaminType.Protein, -deltaProtein);
        }
    }

    /**
     * @brief The Vitamins automation loop.
     *
     * TODO: Implement the automation loop logic.
     */
    static __internal__vitaminsAutomationLoop() {
        // TODO: Add automation loop logic here.
    }
}
