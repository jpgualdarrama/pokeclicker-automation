/**
 * @class The AutomationVitamins class automates the application of optimal vitamins to Pokémon.
 */
const { getBestVitamins } = require('./Utils/OptimalVitamins');

class AutomationVitamins {
    static Settings = {
        FeatureEnabled: "Vitamins-Enabled",
    };

    /**
     * @brief Initializes the AutomationVitamins class.
     *
     * @param {number} initStep - The current automation initialization step.
     */
    static initialize(initStep) {
        if (initStep === Automation.InitSteps.BuildMenu)
        {
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
            if (!pokemon.isShiny) { // Example condition: skip shiny Pokémon
                const optimalVitamins = Automation.Utils.OptimalVitamins.getBestVitamins(pokemon.baseAttack, pokemon.eggCycles, region);

                // Apply vitamins (pseudo-code, replace with actual game logic)
                App.game.vitamins.applyVitamins(pokemon, optimalVitamins);
            }
        });
    }
}

module.exports = AutomationVitamins;
