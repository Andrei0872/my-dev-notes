## Notes on Angular

- [Architecture](#architecture)  
- [Knowledge](#knowledge)

---

### Architecture

- app overview
   - overall goals
      - support viewing/editing customers
      - support viewing order
      
   - key reqs
      - display customers with card/grid option
      - map customers
      - display orders with oaging
      - login/logout with email/password
      - customer editing support (CRUD)
      
- app features
   - customers feature
      - display
      - display on map
   - customer feature
      - CRUD
      - display details on the map
   - Login/Logout feat
   
   
- domain security
   - email/password for initial release
   - tokens ??
   
- domain rules
   - each order must have a customer
   - order totals - shown for a given customer
   - validation...
   
- logging
   - Angular service for logging...
   
- services/communication
   - RESTful Service - Node.js
   - Angular Services
      - Data Services: Use HttpClient
         - Customers/Orders
         - Login/logout (auth)
      - Sorting service
      - Filtering service
      - Logger Service
      - Mediator/EventBus if needed
   - HttpInterceptor - will set the token for HTTP req if token used    
         
- data models
   - app modles/interfaces
      - customer model/interface
      - auth model/interface
   - create a class or just use an interface on the client-side ? (what comes from the server)
      - interface (less bundle size; use this if only for intellisense)
      - class (if the model would have functions)
      
- feature components
   - customers 
      - display/filter/sort/page customers (need data service
   - customer
      -CRUD (need data service and modal needed for deletes)
   - orders
      - display/page orders
   - login
      - login form and logout functionality (need auth service)

- shared functionality
   - toast/growl (success/information)
   - google maos
   - pager
   - modal
   - menu
   - grid/card (used more than once?)

---

### Knowledge

**components**
   * declarative
      - declared in the _template_
   * imperative (entry components)
      - the bootstrapped root component
      - a component you specify in a route definition
      - _not_ referenced in a template