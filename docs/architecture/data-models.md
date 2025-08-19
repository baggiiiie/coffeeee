# Data Models

Below are the primary data models for the application.

### User Model
| Field | Type | Description | Constraints |
|---|---|---|---|
| `ID` | `int64` | Unique identifier for the user. | Primary Key, Auto-increment |
| `Username` | `string` | User's chosen username. | Required, Unique |
| `Email` | `string` | User's email address. | Required, Unique |
| `PasswordHash` | `string` | Hashed password for authentication. | Required |
| `PasswordSalt` | `string` | Salt used for password hashing. | Required |
| `CreatedAt` | `datetime` | Timestamp of user creation. | Required |
| `UpdatedAt` | `datetime` | Timestamp of last user update. | Required |

### Coffee Model
| Field | Type | Description | Constraints |
|---|---|---|---|
| `ID` | `int64` | Unique identifier for the coffee. | Primary Key, Auto-increment |
| `Name` | `string` | The name of the coffee. | Required, Unique (per roaster) |
| `Origin` | `string` | The origin country or region of the beans. | Optional |
| `Roaster` | `string` | The company that roasted the coffee. | Optional |
| `Description` | `text` | General description of the coffee's flavor profile from the roaster. | Optional |
| `PhotoPath` | `string` | Path to a general photo of the coffee bag/beans. | Optional |
| `CreatedAt` | `datetime` | Timestamp of coffee creation in the system. | Required |
| `UpdatedAt` | `datetime` | Timestamp of last coffee update. | Required |

### BrewLog Model
This model will store the details of each individual brewing session. The coffee-to-water ratio will be calculated from the `CoffeeWeight` and `WaterWeight` fields.

| Field | Type | Description | Constraints |
|---|---|---|---|
| `ID` | `int64` | Unique identifier for the log entry. | Primary Key, Auto-increment |
| `UserID` | `int64` | Foreign key to the `User` who created the log. | Required, Foreign Key to `User.ID` |
| `CoffeeID` | `int64` | Foreign key to the `Coffee` being brewed. | Required, Foreign Key to `Coffee.ID` |
| `BrewMethod` | `string` | The method used for this specific brew (e.g., "V60", "Aeropress"). | Required |
| `CoffeeWeight` | `float` | Weight of the coffee in grams. | Optional |
| `WaterWeight` | `float` | Weight of the water in grams. | Optional |
| `GrindSize` | `string` | The grinder setting used (e.g., "Medium-Fine", "18"). | Optional |
| `WaterTemperature` | `float` | The temperature of the water in Celsius or Fahrenheit. | Optional |
| `BrewTime` | `int` | The total brew time in seconds. Will be displayed as mm:ss on the frontend. | Optional |
| `TastingNotes` | `text` | Specific notes for this brew. | Optional |
| `Rating` | `int` | User's rating for this specific brew (1-5). | Optional |
| `CreatedAt` | `datetime` | Timestamp of log entry creation. | Required |

---