# Sample-AI

## High-Level User Flow

- User visits the website and logs in with their Xero account.
- The user selects the organization from which they want to retrieve data.
- Azure serverless function is called to fetch data from the Xero API.
- The retrieved data is stored in the SQL database.
- User can ask questions related to their data using the chatbot interface.
- The chatbot processes the user's query and categorizes it if it needs to convert text to SQL or not.
  - If the query needs to convert text to SQL, it uses the GPT-4o model and gets example SQL queries with SQL Schema from the Azure AI Search based on the user's query.
  - If a query does not need to convert text to SQL, it uses the GPT-4o model to get the answer directly.
  - If files are attached, the GPT-4o model is used to get the answer directly.
- The chatbot returns the answer to the user.
- Users can view the retrieved data in a user-friendly format.
- Users can ask follow-up questions or request additional information.
- User can log out.

## Sequence Diagram

```mermaid
sequenceDiagram
    participant User
    participant Django
    participant Database
    participant LLM as GPT-4o
    participant AzureFunction as Azure Serverless Function
    participant Xero as Xero API
    participant AISearch as Azure AI Search

    User->>Xero: Log in with Xero account
    Xero-->>Django: Authentication token
    Django-->>User: Ask for organization
    User->>Django: Select organization
    Django->>AzureFunction: Run Cron job to fetch data (This will run once a day)
    AzureFunction->>Xero: Fetch data from Xero API
    AzureFunction->>Database: Store retrieved data
    User->>Django: Ask question/query
    Django->>AISearch: Retrieve relevant example queries
    AISearch-->>Django: Example SQL queries
    Django->>LLM: convert text to SQL based on example queries if possible or give answer directly
    Django-->>Database: Execute SQL query
    Database-->>Django: Return results
    Django-->>User: Display results in chatbot interface
    User->>Django: Ask follow-up question

    note over AzureFunction: Fetches data from Xero API
    note over LLM: Processes queries using GPT-4o
    note over Database: Stores and retrieves data
```
