/*
Variable for the sport types
*/
var sportTypes = [
   {
       type: 'Swim',
       keys: [
                    'uszas',
                    'uszás',
                    'úsz',
                    'úszás',
                    'swim',
                    'schwim'
       ],
       defDistance: 2, //km 
       defDuration: 60 //WASP & Vito edzés
   },
   {
         type: 'Run',
         keys: [
                      'run',
                      'futas',
                      'futás'                      
         ],
         distanceFilters: [
          {
              key: 'nidda',
              value: 8.5
          }
         ],
         defDistance: 8.5, //km - Niddakör, Majnakör munkában kb.
         defDuration: 45 // min futóidő 45perc
     },
    {
        type: 'Bike',
        keys: [
                     'bike',
                     'ride',
                     'bring',
                     'bicik',
                     'teker'
        ],
        distanceFilters: [
          {
              key: 'munk',
              value: 20
          },
          {
              key: 'feldberg',
              value: 50
          }
        ],

        defDistance: 20, //munkába járás km 
        defDuration: 60  //munkába járásos
    },
    
     {
         type: 'other',
         keys: [
         ],
         defDuration: 60
     }
  
];
