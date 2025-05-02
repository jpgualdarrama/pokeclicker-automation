/**
 * @class The AutomationVitamins class automates the application of optimal vitamins to Pokémon.
 */

class AutomationVitamins {
    static Settings = {
        FeatureEnabled: "Vitamins-Enabled",
        SkipShiny: "Vitamins-SkipShiny",
    };

    /**
     * @brief Initializes the AutomationVitamins class.
     *
     * @param {number} initStep - The current automation initialization step.
     */
    static initialize(initStep) {
        if (initStep === Automation.InitSteps.BuildMenu)
        {
            Automation.Utils.LocalStorage.setDefaultValue(this.Settings.SkipShiny, true);
            // Build the menu
            this.__internal__buildMenu();
        }
        else if (initStep === Automation.InitSteps.Finalize)
        {
            // Restore previous session state
            this.toggleAutoVitamins();
        }
    }

    /**
     * @brief Toggles the 'Vitamins' feature.
     *
     * @param {boolean} [enable] - Optional. If provided, sets the feature state explicitly.
     */
    static toggleAutoVitamins(enable) {
        // If no explicit state is provided, use the stored value
        if (enable !== true && enable !== false) {
            enable = Automation.Utils.LocalStorage.getValue(this.Settings.FeatureEnabled) === "true";
        }

        if (enable) {
            // Start the automation loop if not already active
            if (this.__internal__autoVitaminsLoop === null) {
                this.__internal__autoVitaminsLoop = setInterval(this.__internal__vitaminsLoop.bind(this), 1000); // Runs every second
                this.__internal__vitaminsLoop();
            }
        } else {
            // Stop the automation loop
            clearInterval(this.__internal__autoVitaminsLoop);
            this.__internal__autoVitaminsLoop = null;
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
        // Add the related buttons to the automation menu
        const vitaminsContainer = document.createElement("div");
        Automation.Menu.AutomationButtonsDiv.appendChild(vitaminsContainer);

        Automation.Menu.addSeparator(vitaminsContainer);

        const autoVitaminsTooltip = "Automatically applies optimal vitamins to Pokémon based on their stats.";
        const autoVitaminsButton = Automation.Menu.addAutomationButton(
            "Vitamins",
            this.Settings.FeatureEnabled,
            autoVitaminsTooltip,
            vitaminsContainer
        );
        autoVitaminsButton.addEventListener("click", this.toggleAutoVitamins.bind(this), false);

        const vitaminsSettingPanel = Automation.Menu.addSettingPanel(autoVitaminsButton.parentElement.parentElement);

        const titleDiv = Automation.Menu.createTitleElement("Vitamins advanced settings");
        titleDiv.style.marginBottom = "10px";
        vitaminsSettingPanel.appendChild(titleDiv);

        const skipShinyTooltip = "Skip shiny Pokémon when applying vitamins.";
        Automation.Menu.addLabeledAdvancedSettingsToggleButton(
            "Skip shiny Pokémon",
            this.Settings.SkipShiny,
            skipShinyTooltip,
            vitaminsSettingPanel
        );
    }

    /**
     * @brief The Vitamins automation loop.
     *
     * Iterates through Pokémon and applies optimal vitamins.
     */
    static __internal__vitaminsLoop() {
        const region = player.highestRegion();
        const pokemonList = App.game.party.caughtPokemon;

        pokemonList.forEach(pokemon => {
            console.log("Pokemon: ", pokemon);

            let applyVitamins = (!pokemon.shiny) || (pokemon.shiny && !(Automation.Utils.LocalStorage.getValue(this.Settings.SkipShiny) == "false"));

            console.log("Shiny: ", pokemon.shiny,
                        ", Skip shiny: ", Automation.Utils.LocalStorage.getValue(this.Settings.SkipShiny),
                        ", Apply vitamins: ", applyVitamins);

            if (applyVitamins)
            {
                const optimalVitamins = Automation.Utils.OptimalVitamins.getBestVitamins(pokemon.baseAttack, pokemon.eggCycles, region);

                console.log("Optimal vitamins: ", optimalVitamins);

                // Apply vitamins using the new internal function
                this.__internal__applyVitamins(
                    pokemon,
                    optimalVitamins.carbos,
                    optimalVitamins.calcium,
                    optimalVitamins.protein
                );
            }
        });
    }

    /**
     * @brief Applies vitamins to a Pokémon based on the provided object structure.
     *
     * @param {Object} pkmn - The Pokémon to apply vitamins to.
     * @param {number} carbos - The amount of Carbos to apply.
     * @param {number} calcium - The amount of Calcium to apply.
     * @param {number} protein - The amount of Protein to apply.
     */
    static __internal__applyVitamins(pkmn, carbos, calcium, protein) {
        if (player.itemList.Carbos() > 0 && carbos > 0) {
            pkmn.useVitamin(GameConstants.VitaminType.Carbos, Math.min(player.itemList.Carbos(), carbos));
        }
        if (player.itemList.Calcium() > 0 && calcium > 0) {
            pkmn.useVitamin(GameConstants.VitaminType.Calcium, Math.min(player.itemList.Calcium(), calcium));
        }
        if (player.itemList.Protein() > 0 && protein > 0) {
            pkmn.useVitamin(GameConstants.VitaminType.Protein, Math.min(player.itemList.Protein(), protein));
        }
    }
}
