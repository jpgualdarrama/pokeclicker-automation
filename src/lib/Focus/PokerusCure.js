/**
 * @class The AutomationFocusPokerusCure regroups the 'Focus on' button's 'Pokérus cure' functionalities
 */
class AutomationFocusPokerusCure
{
    /******************************************************************************\
    |***    Focus specific members, should only be used by focus sub-classes    ***|
    \******************************************************************************/

    /**
     * @brief Adds the Pokérus cure functionality to the 'Focus on' list
     *
     * @param {Array} functionalitiesList: The list to add the functionality to
     */
    static __registerFunctionalities(functionalitiesList)
    {
        this.__internal__buildPokerusRouteList();

        const isUnlockedCallback = function (){ return App.game.keyItems.hasKeyItem(KeyItemType.Pokerus_virus); };

        functionalitiesList.push(
            {
                id: "PokerusCure",
                name: "Pokérus cure",
                tooltip: "Hunts for pokémons that are infected by the pokérus"
                       + Automation.Menu.TooltipSeparator
                       + "Pokémons get resistant to the pokérus once they reach 50 EV.\n"
                       + "This focus will catch pokémons one route where infected\n"
                       + "pokémons can be caught to increase their EV.",
                run: function (){ this.__internal__start(); }.bind(this),
                stop: function (){ this.__internal__stop(); }.bind(this),
                isUnlocked: isUnlockedCallback,
                refreshRateAsMs: Automation.Focus.__noFunctionalityRefresh
            });
    }

    /**
     * @brief Builds the 'Focus on Pokérus Cure' advanced settings tab
     *
     * @param {Element} parent: The parent div to add the settings to
     */
    static __buildAdvancedSettings(parent)
    {
        // Disable Beastball usage by default
        Automation.Utils.LocalStorage.setDefaultValue(this.__internal__advancedSettings.AllowBeastBallUsage, false);

        // OakItem loadout setting
        const tooltip = "Allows the automation to use Beastball to catch UltraBeast pokémons."
                      + Automation.Menu.TooltipSeparator
                      + "If this option is disabled, or you don't have Beastballs,\n"
                      + "UltraBeast pokémons will be ignored.";
        Automation.Menu.addLabeledAdvancedSettingsToggleButton("Use Beastballs to catch UltraBeast pokémons",
                                                               this.__internal__advancedSettings.AllowBeastBallUsage,
                                                               tooltip,
                                                               parent);
    }

    /*********************************************************************\
    |***    Internal members, should never be used by other classes    ***|
    \*********************************************************************/

    static __internal__advancedSettings = {
                                              AllowBeastBallUsage: "Focus-PokerusCure-AllowBeastBallUsage"
                                          };

    static __internal__pokerusCureLoop = null;
    static __internal__pokerusRouteData = [];
    static __internal__pokeballToRestore = null;

    static __internal__currentRouteData = null;

    /**
     * @brief Starts the achievements automation
     */
    static __internal__start()
    {
        // Set achievement loop
        this.__internal__pokerusCureLoop = setInterval(this.__internal__focusOnPokerusCure.bind(this), 10000); // Runs every 10 seconds
        this.__internal__focusOnPokerusCure();
    }

    /**
     * @brief Stops the achievements automation
     */
    static __internal__stop()
    {
        this.__internal__currentRouteData = null;

        // Unregister the loop
        clearInterval(this.__internal__pokerusCureLoop);
        this.__internal__pokerusCureLoop = null;

        // Restore pokéball used to catch
        if (this.__internal__pokeballToRestore != null)
        {
            Automation.Utils.Battle.setAlreadyCaughtContagiousSelection(this.__internal__pokeballToRestore);
            this.__internal__pokeballToRestore = null;
        }
    }

    /**
     * @brief The achievement main loop
     *
     * @note If the user is in a state in which he cannot be moved, the feature is automatically disabled.
     */
    static __internal__focusOnPokerusCure()
    {
        // Already fighting, nothing to do for now
        if (Automation.Utils.isInInstanceState())
        {
            Automation.Focus.__ensureNoInstanceIsInProgress();
            return;
        }

        // Choose a new route, if needed
        if ((this.__internal__currentRouteData == null)
            || !this.__internal__doesAnyPokemonNeedCuring(this.__internal__currentRouteData.route, true))
        {
            this.__internal__setNextPokerusRoute();
        }

        if (this.__internal__currentRouteData == null)
        {
            // No more routes available, stop the focus
            Automation.Menu.forceAutomationState(Automation.Focus.Settings.FeatureEnabled, false);
            Automation.Notifications.sendWarningNotif("No more route available to cure pokémon from pokérus.\nTurning the feature off", "Focus");

            return;
        }

        // Ensure that the player has some balls available
        if (!Automation.Focus.__ensurePlayerHasEnoughBalls(Automation.Focus.__pokeballToUseSelectElem.value))
        {
            // Restore pokéball used to catch
            if (this.__internal__pokeballToRestore != null)
            {
                Automation.Utils.Battle.setAlreadyCaughtContagiousSelection(this.__internal__pokeballToRestore);
                this.__internal__pokeballToRestore = null;
            }

            return;
        }

        // Equip the Oak item catch loadout
        Automation.Focus.__equipLoadout(Automation.Utils.OakItem.Setup.PokemonCatch);

        // Equip an "Already caught contagious" pokeball
        this.__internal__pokeballToRestore = App.game.pokeballs.alreadyCaughtContagiousSelection;

        const pokeballToUse = (this.__internal__currentRouteData.needsBeastBall) ? GameConstants.Pokeball.Beastball
                                                                                 : Automation.Focus.__pokeballToUseSelectElem.value;

        Automation.Utils.Battle.setAlreadyCaughtContagiousSelection(pokeballToUse);

        // Move to the best route
        Automation.Utils.Route.moveToRoute(this.__internal__currentRouteData.route.number, this.__internal__currentRouteData.route.region);
    }

    /**
     * @brief Gets the next route to cure pokémon from pokérus
     */
    static __internal__setNextPokerusRoute()
    {
        // Remove the current route from the list if completed
        if ((this.__internal__currentRouteData != null)
            && !this.__internal__doesAnyPokemonNeedCuring(this.__internal__currentRouteData.route))
        {
            const index = this.__internal__pokerusRouteData.indexOf(this.__internal__currentRouteData);
            this.__internal__pokerusRouteData.splice(index, 1);
        }

        // Set the next best route
        this.__internal__currentRouteData = this.__internal__pokerusRouteData.find(
            (data) => this.__internal__doesAnyPokemonNeedCuring(data.route, true), this);

        // Determine if the beast ball is the only catching option
        this.__internal__currentRouteData.needsBeastBall = this.__internal__doesRouteNeedBeastBalls(this.__internal__currentRouteData.route);
    }

    /**
     * @brief Builds the internal list of route with at least one infected pokémon
     */
    static __internal__buildPokerusRouteList()
    {
        for (const route of Routes.regionRoutes)
        {
            if (this.__internal__doesAnyPokemonNeedCuring(route))
            {
                this.__internal__pokerusRouteData.push({ route });
            }
        }

        // Put Magikarp jump last
        this.__internal__pokerusRouteData.sort((routeA, routeB) =>
            {
                const isAmagikarp = Automation.Utils.Route.isInMagikarpJumpIsland(routeA.route.region, routeA.route.subRegion);
                const isBmagikarp = Automation.Utils.Route.isInMagikarpJumpIsland(routeB.route.region, routeB.route.subRegion);

                if (isAmagikarp && !isBmagikarp) return 1;
                if (isBmagikarp && !isAmagikarp) return -1;

                return 0;
            });
    }

    /**
     * @brief Checks if any pokémon from the given @p route needs to be cured
     *
     * @param route: The route to check
     *
     * @param {boolean} onlyConsiderAvailableContagiousPokemons: Whether only currently available and contagious pokémon should be considered
     *
     * @returns True if every pokémons are cured, false otherwise
     */
    static __internal__doesAnyPokemonNeedCuring(route, onlyConsiderAvailableContagiousPokemons = false)
    {
        const pokemonList = onlyConsiderAvailableContagiousPokemons ? RouteHelper.getAvailablePokemonList(route.number, route.region)
                                                                    : this.__internal__getEveryPokemonForRoute(route);

        // Skip UltraBeast pokémons if the player disabled the feature or there is no Beastball left
        const skipUltraBeasts = (Automation.Utils.LocalStorage.getValue(this.__internal__advancedSettings.AllowBeastBallUsage) == "false")
                             || (App.game.pokeballs.getBallQuantity(GameConstants.Pokeball.Beastball) === 0);

        return pokemonList.some((pokemonName) =>
            {
                const pokemon = App.game.party.getPokemonByName(pokemonName);

                if (onlyConsiderAvailableContagiousPokemons && skipUltraBeasts && (GameConstants.UltraBeastType[pokemonName] != undefined))
                {
                    return false;
                }

                // A pokémon is a candidate to catch if
                //  - It's not already cured
                //  - It's contagious or we are listing every uncured pokemon
                return (pokemon?.pokerus != GameConstants.Pokerus.Resistant)
                    && (!onlyConsiderAvailableContagiousPokemons || (pokemon?.pokerus == GameConstants.Pokerus.Contagious))
            });
    }

    /**
     * @brief Determines if the given @p route only contains contagious UltraBeasts.
     *        In such case the beast ball is the only possible pokeball to catch them.
     *
     * @param route: The route to check
     *
     * @returns True if the route only contains contagious UltraBeasts, false otherwise.
     */
    static __internal__doesRouteNeedBeastBalls(route)
    {
        return RouteHelper.getAvailablePokemonList(route.number, route.region).every((pokemonName) =>
            {
                const pokemon = App.game.party.getPokemonByName(pokemonName);
                return (pokemon?.pokerus != GameConstants.Pokerus.Contagious)
                    || (GameConstants.UltraBeastType[pokemonName] != undefined)
            });
    }

    /**
     * @brief Gets the list of possible pokémon for a route, regardless of their conditions
     *
     * @param route: The route to get the pokémon of
     *
     * @returns The list of pokémon
     */
    static __internal__getEveryPokemonForRoute(route)
    {
        // Inspired from https://github.com/pokeclicker/pokeclicker/blob/f7d8db69c219a1a1e47be919f4b9b1f0de8cde9e/src/scripts/wildBattle/RouteHelper.ts#L15-L39

        const possiblePokemons = Routes.getRoute(route.region, route.number)?.pokemon;
        if (!possiblePokemons)
        {
            return ['Rattata'];
        }

        // Land Pokémon
        let pokemonList = possiblePokemons.land;

        // Water Pokémon
        pokemonList = pokemonList.concat(possiblePokemons.water);

        // Headbutt Pokémon
        pokemonList = pokemonList.concat(possiblePokemons.headbutt);

        // Special requirement Pokémon
        pokemonList = pokemonList.concat(...possiblePokemons.special.map(p => p.pokemon));

        // Filter duplicate entries
        pokemonList.filter((item, index) => pokemonList.indexOf(item) === index);

        return pokemonList;
    }
}
