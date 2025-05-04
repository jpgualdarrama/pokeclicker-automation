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
        const vitaminsModal = document.getElementById("vitaminsModal");

        if (!vitaminsModal) {
            console.error("Vitamins modal not found.");
            return;
        }

        const applyVitaminsButton = document.createElement("button");
        applyVitaminsButton.textContent = "Apply Optimal Vitamins";
        applyVitaminsButton.style.margin = "10px";
        applyVitaminsButton.onclick = this.__internal__applyOptimalVitamins.bind(this);

        vitaminsModal.appendChild(applyVitaminsButton);
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

            Automation.Vitamins.__internal__applyVitamins(pokemon, optimalVitamins);
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
        if (player.itemList.Carbos() > 0 && vitamins.carbos > 0) {
            pkmn.useVitamin(GameConstants.VitaminType.Carbos, Math.min(player.itemList.Carbos(), vitamins.carbos));
        }
        if (player.itemList.Calcium() > 0 && vitamins.calcium > 0) {
            pkmn.useVitamin(GameConstants.VitaminType.Calcium, Math.min(player.itemList.Calcium(), vitamins.calcium));
        }
        if (player.itemList.Protein() > 0 && vitamins.protein > 0) {
            pkmn.useVitamin(GameConstants.VitaminType.Protein, Math.min(player.itemList.Protein(), vitamins.protein));
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
