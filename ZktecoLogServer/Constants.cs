namespace ZKT
{
    public static class Constants
    {
        public const string VERSION = "1.0.0";
        public const string CONFIG_FILE = "config.json";
        public const string LOG_FILE = "log.txt";

        // IP addresses
        public const string Tourniquet = "192.168.1.200";
        public const string C1 = "192.168.1.201";
        public const string C2 = "192.168.1.202";
        public const string C3 = "192.168.1.203";
        public const string C4 = "192.168.1.204";
        public const string C5 = "192.168.1.205";
        public const string C6 = "192.168.1.206";
        public const string C7 = "192.168.1.207";
        public const string C8 = "192.168.1.208";
        public const string C9 = "192.168.1.209";

        // CONTROLLER 200
        public const int ENTREE = 1;
        public const int SORTIE = 2;

        // CONTROLLER 201 (C1)
        public const int ENTREE_MAIN = 1;
        public const int SORTIE_MAIN = 2;
        public const int SALLE_TECHNIQUE = 4;
        public const int ENTREE_HALL = 8;

        // CONTROLLER 202 (C2)
        public const int GAME_ON = 1;
        public const int JEUX_CONSOLE_E1 = 2;
        public const int JEUX_CONSOLE_E2 = 4;
        public const int AXE_THROWING_E = 8;

        // CONTROLLER 204 (C4)
        public const int SALLE_INFORMATIQUE = 1;
        public const int ARCADE = 2;
        public const int ESCAPE1_S = 3;
        public const int ESCAPE2_S = 4;

        // CONTROLLER 205 (C5)
        public const int ESCAPE3_E = 1;
        public const int ESCAPE3_S = 2;
        public const int AXE_THROWING_E2 = 3;
        public const int AXE_THROWING_S = 4;

        // CONTROLLER 206 (C6)
        public const int BUREAU_GERANT = 1;
        public const int ESCAPE1_E = 2;
        public const int FLOOR_IS_LAVA = 3;
        public const int JEUX_INFORMATISE = 4;

        // CONTROLLER 207 (C7)
        public const int ENTREE_SORTIE_207 = 1;
        public const int SALLE_JEUX_207 = 2;
        public const int ESCAPE2_E = 3;
        public const int SALLE_REUNION = 4;

        // CONTROLLER 208 (C8)
        public const int ESCAPE5_E = 1;
        public const int ESCAPE4_E = 2;

        // CONTROLLER 209 (C9)
        public const int SALLE_DEPOT = 1;
        public const int ASCENSEUR = 2;
        public const int CUISINE = 4;
    }
}
