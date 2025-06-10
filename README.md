<div align="center">
  <h1 align="center">Climate Intelligence Hub</h1>
  <p align="center">
    A data-driven dashboard providing insights into our planet's climate.
    <br />
    <br />
    <a href="https://tabitha-dev.github.io/Climate_Intelligence_Hub/"><strong>View Live Site »</strong></a>
    <br />
    <br />
    <a href="https://github.com/tabitha-dev/Climate_Intelligence_Hub/issues">Report Bug</a>
    ·
    <a href="https://github.com/tabitha-dev/Climate_Intelligence_Hub/issues">Request Feature</a>
  </p>
</div>

<p align="center">
  <a href="https://github.com/tabitha-dev/Climate_Intelligence_Hub/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License">
  </a>
  <a href="https://github.com/tabitha-dev/Climate_Intelligence_Hub/issues">
    <img src="https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat" alt="Contributions welcome">
  </a>
</p>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#about-this-project">About This Project</a></li>
    <li><a href="#key-features">Key Features</a></li>
    <li><a href="#built-with">Built With</a></li>
    <li><a href="#getting-started">Getting Started</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

---

## About This Project

The **Climate Intelligence Hub** is a comprehensive, single-page web application designed to make critical environmental data accessible and understandable to everyone. It aggregates and visualizes information from multiple APIs, providing insights into climate trends, air quality, and the latest environmental news.

This project was built to serve as a centralized dashboard for climate awareness, empowering researchers, educators, and the public to make informed decisions for a sustainable future.

## Key Features

* **✨ My Climate Snapshot:** A personalized dashboard that uses geolocation to display the user's local Air Quality Index (AQI) upon loading.
* **📊 Interactive Data Visualization:** The Global Climate Explorer and CO₂ Time-Lapse tools use Chart.js to create responsive and easy-to-understand charts.
* **🔍 Multi-API Integration:** Aggregates data from several sources to provide a holistic view of climate data, news, and air quality.
* **📚 Educational Content:** Includes dedicated sections that explain the core causes and effects of climate change and provide actionable steps for users.
* **📱 Fully Responsive Design:** A modern, single-page interface that works seamlessly across desktops, tablets, and mobile devices.
* **🚀 Pure Vanilla Stack:** Built with fundamental web technologies—no frameworks needed—making it lightweight, fast, and easy to maintain.

## Built With

This website is built entirely with client-side technologies, making it perfect for static hosting on platforms like GitHub Pages.

<p align="left">
  <a href="https://developer.mozilla.org/en-US/docs/Web/HTML"><img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5"></a>
  <a href="https://developer.mozilla.org/en-US/docs/Web/CSS"><img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3"></a>
  <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript"><img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript"></a>
  <a href="https://www.chartjs.org/"><img src="https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white" alt="Chart.js"></a>
</p>

## Getting Started

To get a local copy up and running, follow these simple steps.

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/tabitha-dev/Climate_Intelligence_Hub.git](https://github.com/tabitha-dev/Climate_Intelligence_Hub.git)
    ```

2.  **Navigate to the project directory:**
    ```bash
    cd Climate_Intelligence_Hub
    ```

3.  **Open `index.html` in your browser:**
    You can simply double-click the `index.html` file, or if you have a local server extension (like Live Server for VS Code), you can use that to view the site.

### API Key Configuration

To use the application with your own data limits, you will need to get a free API key from [RapidAPI](https://rapidapi.com/).

Once you have your key, open the `index.html` file and locate the `API_CONFIG` object within the `<script>` tag at the bottom of the file. Replace the placeholder key with your own:

```javascript
const API_CONFIG = {
    rapidApiKey: 'YOUR_RAPIDAPI_KEY_HERE', // <--- REPLACE THIS
    aqiApiToken: 'demo', 
    // ... rest of the config
};
```

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` file for more information.

## Contact

Tabitha Khadse - [tabitha@ieee.org](mailto:tabitha@ieee.org)

Project Link: [https://github.com/tabitha-dev/Climate_Intelligence_Hub](https://github.com/tabitha-dev/Climate_Intelligence_Hub)
