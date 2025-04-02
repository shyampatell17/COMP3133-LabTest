# SpaceX Mission Tracker

This Angular application displays information about SpaceX launches using the SpaceX API. Users can view a list of missions, filter them by launch year, and see detailed information about each mission.

## Features

- View all SpaceX missions
- Filter missions by launch year
- View detailed information about each mission
- Responsive Material Design UI
- Links to articles, Wikipedia pages, and launch videos

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd 101412165-lab-test2-comp3133
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
ng serve
```

4. Open your browser and navigate to `http://localhost:4200`

## Build

To build the project for production:

```bash
ng build
```

The build artifacts will be stored in the `dist/` directory.

## Technologies Used

- Angular 17
- Angular Material
- SpaceX API
- TypeScript
- RxJS

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── missionlist/
│   │   ├── missionfilter/
│   │   └── missiondetails/
│   ├── services/
│   │   └── spacex.service.ts
│   ├── models/
│   │   └── spacex.interface.ts
│   └── ...
└── ...
```

## API Reference

This project uses the SpaceX API v3:
- GET `/launches` - Fetch all launches
- GET `/launches?launch_year={year}` - Filter launches by year
- GET `/launches/{flight_number}` - Get specific launch details

## Author

Shyam Patel

## License

This project is licensed under the MIT License.
