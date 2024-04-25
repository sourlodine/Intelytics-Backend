# Task List

## Completed Tasks

- [x] Volume Added to the DB (Completed on 2024-04-12)
- [x] API endpoint created for getDataByInterval and functional (Completed on 2024-04-12)

## Ongoing Tasks

- [ ] Creating User Schema
- [ ] Creating routes for Login
- [ ] Creating routes for Register 

## Upcoming Tasks




# API Documentation

## Overview

<!-- This document describes the API for [Service Name]. It provides access to our [services/functions/features] through HTTP requests. -->

## Base URL

The Base URL for all API requests is `http://50.117.104.207:3000/api`

<!-- ## Authentication -->

<!-- ### API Keys

- **Required**: Yes
- **Type**: API Key
- **Usage**: Include the API key in the request header. -->
  




### Endpoints:

    1. Get Current Price

    URL: /getCurrentPrice

    Method: GET

    Queries:
    tokenName (string) - use the token symbol

    Success Response: 200 OK

    Content:
    
        {
            "token": "XNJ",
            "price": "0.008366"
        }
    

    Error Response: 404 Not Found
    
    
    Content:

    
    
    
    2. 

