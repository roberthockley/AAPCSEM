import { useState, useEffect, useMemo, useRef } from 'react';
import Header from "@cloudscape-design/components/header";
import TextContent from "@cloudscape-design/components/text-content";
import './App.css';
import { AmazonConnectApp, AppContactScope } from "@amazon-connect/app";
import { ContactClient, AgentClient, AgentStateChangedEventData, ContactStartingAcwEventData } from "@amazon-connect/contact";
import Table from "@cloudscape-design/components/table";
import Link from "@cloudscape-design/components/link";
import Button from "@cloudscape-design/components/button";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Icon from "@cloudscape-design/components/icon";
import { useToaster, Toaster } from '@twilio-paste/core/toast';
import { Theme } from '@twilio-paste/theme';

var permissions = [];
let contactId;
const connectApp = AmazonConnectApp.init({
  onCreate: (event) => {
    const { appInstanceId } = event.context;
    const { contactScope } = event.context;
    console.log('**** App initialized: ', appInstanceId);
    console.log("**** EVENT", event)
    console.log("**** length", event.context.appConfig.permissions.length)
    permissions = event.context.appConfig.permissions;
    contactId = event.context.contactScope.contactId
  },
  onDestroy: (event) => {
    console.log('**** App being destroyed');
  },
});
const excludedAttributes = [];

const EATable = ({ qaHistory, setQaHistory, visibleCount, setVisibleCount, socketRef, attributes, toaster }) => {
  const sendFeedback = (result, contactId, requestId, question, response) => {

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      console.log("***** Feedback", contactId, requestId, result, question, response)
      socketRef.current.send(JSON.stringify({
        contactId,
        requestId: requestId,
        result: result,
        question: attributes.AAQuestion,
        response: attributes.AAText
      }));
      toaster.push({
        message: 'Successfully sent',
        variant: 'success',
        dismissAfter: 2000
      })
    } else {
      console.warn("WebSocket is not connected.");
    }
  };

  function renderWithLinks(text) {
    if (typeof text !== 'string') return text;

    // Regex to match http/https URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    const parts = text.split(urlRegex);

    return parts.map((part, index) =>
      urlRegex.test(part) ? (
        <Link key={index} href={part} target="_blank" external onFollow={() =>
          alert("You clicked the button link!")
        }>
          {part}
        </Link>
      ) : (
        <span key={index}>{part}</span>
      )
    );
  }

  const displayedItems = qaHistory.slice(0, visibleCount).map((item, index) => ({
    name: item.question,
    value: item.answer,
    reference: item.reference,
    searchSent: item.searchSent,
    index,
  }));

  const handleSearch = (index) => {
    const question = qaHistory[index].question;

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        contactId,
        questionForKB: question
      }));

      const updated = [...qaHistory];
      updated[index].searchSent = true;
      setQaHistory(updated);
    } else {
      console.warn("WebSocket is not connected.");
    }
  };

  const summaryColumnDefinitions = [
    {
      id: "name",
      header: "Question",
      cell: item => item.name,
      width: 400,
      wrap: true
    },
    {
      id: "value",
      header: "Answer",
      cell: item => renderWithLinks(item.value),
      wrap: true
    },
    {
      id: "action",
      header: "Action",
      cell: item => item.searchSent ? (
        <div className="icon-container" style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => sendFeedback("Positive", contactId, attributes.requestId)}//console.log("**** ThumbsUp", contactId, attributes.requestId)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer'
            }}
            title="Thumbs Up"
          >
            <Icon
              size="medium"
              svg={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 -960 960 960"
                  width="24"
                  height="24"
                >
                  <path
                    d="M720-120H280v-520l280-280 50 50q7 7 11.5 19t4.5 23v14l-44 174h258q32 0 56 24t24 56v80q0 7-2 15t-4 15L794-168q-9 20-30 34t-44 14Zm-360-80h360l120-280v-80H480l54-220-174 174v406Zm0-406v406-406Zm-80-34v80H160v360h120v80H80v-520h200Z"
                    fill="#00aa00"
                  />
                </svg>
              }
            />
          </button>

          <button
            onClick={() => sendFeedback("Negative", contactId, attributes.requestId)}//console.log("**** ThumbsDown", contactId, attributes.requestId)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer'
            }}
            title="Thumbs Down"
          >
            <Icon
              size="medium"
              svg={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 -960 960 960"
                  width="24"
                  height="24"
                >
                  <path
                    d="M240-840h440v520L400-40l-50-50q-7-7-11.5-19t-4.5-23v-14l44-174H120q-32 0-56-24t-24-56v-80q0-7 2-15t4-15l120-282q9-20 30-34t44-14Zm360 80H240L120-480v80h360l-54 220 174-174v-406Zm0 406v-406 406Zm80 34v-80h120v-360H680v-80h200v520H680Z"
                    fill="#ff0000"
                  />
                </svg>
              }
            />
          </button>
        </div>
      ) : (
        <div className="button-wrapper">
          <Button
            variant="primary"
            onClick={() => handleSearch(item.index)}
          >
            Search
          </Button>
        </div>
      ),
      width: 160,
      minWidth: 160,
      wrap: false
    }
    /*
        {
          id: "action",
          header: "Action",
          cell: item => item.searchSent ? (
            <div className="icon-container">
              <Icon
                size="medium"
                svg={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 -960 960 960"
                    width="24"
                    height="24"
                  >
                    <path
                      d="M720-120H280v-520l280-280 50 50q7 7 11.5 19t4.5 23v14l-44 174h258q32 0 56 24t24 56v80q0 7-2 15t-4 15L794-168q-9 20-30 34t-44 14Zm-360-80h360l120-280v-80H480l54-220-174 174v406Zm0-406v406-406Zm-80-34v80H160v360h120v80H80v-520h200Z"
                      fill="#00aa00"
                    />
                  </svg>
                }
                style={{ color: '#00aa00' }}
              />
    
              <Icon
                size="medium"
                svg={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 -960 960 960"
                    width="24"
                    height="24"
                  >
                    <path
                      d="M240-840h440v520L400-40l-50-50q-7-7-11.5-19t-4.5-23v-14l44-174H120q-32 0-56-24t-24-56v-80q0-7 2-15t4-15l120-282q9-20 30-34t44-14Zm360 80H240L120-480v80h360l-54 220 174-174v-406Zm0 406v-406 406Zm80 34v-80h120v-360H680v-80h200v520H680Z"
                      fill="#ff0000"
                    />
                  </svg>
                }
                style={{ color: '#ff0000' }}
              />
            </div>
          ) : (
            <div className="button-wrapper">
              <Button
                variant="primary"
                onClick={() => handleSearch(item.index)}
              >
                Search
              </Button>
            </div>
          ),
          width: 160,
          minWidth: 160,
          wrap: false
        }
    */
  ];


  return (
    <div>
      <Table
        columnDefinitions={summaryColumnDefinitions}
        items={displayedItems}
        wrapLines
        header={<Header>Knowledge Base Results</Header>}
        variant="embedded"
      />
      {qaHistory.length > 3 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
          {visibleCount > 3 && (
            <Button variant="secondary" onClick={() => setVisibleCount(Math.max(3, visibleCount - 2))}>
              Less
            </Button>
          )}
          {visibleCount < qaHistory.length && (
            <Button variant="secondary" onClick={() => setVisibleCount(Math.min(qaHistory.length, visibleCount + 2))}>
              More
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

const PCSTable = ({ attributes }) => {
  console.log("**** Attributes are: ", attributes.PCSSummary1)
  let notesExist = false
  if (attributes.PCSNote) {
    notesExist = true
  }
  let summaryExist = false
  if (attributes.PCSSummary1) {
    summaryExist = true
  }
  console.log("**** PCSTable Attributes", attributes)
  const summaryItems = useMemo(() => {
    return Object.entries(attributes)
      .map(([key, value]) => ({
        key,
        name: key,
        value,
        size: "Large"
      }))
      .filter(item => item.name.startsWith("PCSSummary"));
  }, [attributes]);
  console.log("**** summ items", summaryItems)
  const actionItems = useMemo(() => {
    return Object.entries(attributes)
      .filter(([key]) => !excludedAttributes.includes(key))
      .map(([key, value]) => ({
        key,
        name: key,
        value,
        size: "Large"
      }))
      .filter(item => item.name.startsWith("PCSAction"));
  }, [attributes]);

  const noteItems = useMemo(() => {
    return Object.entries(attributes)
      .filter(([key]) => !excludedAttributes.includes(key))
      .map(([key, value]) => ({
        key,
        name: key,
        value,
        size: "Large"
      }))
      .filter(item => item.name.startsWith("PCSNote"));
  }, [attributes]);

  const summaryColumnDefinitions = [
    {
      id: 'value',
      header: 'Summary:',
      cell: item => item.value,
    },
  ];

  const actionColumnDefinitions = [
    {
      id: 'value',
      header: 'Actions:',
      cell: item => item.value,
    },
  ];
  const noteColumnDefinitions = [
    {
      id: 'value',
      header: 'Notes:',
      cell: item => item.value,
    },
  ];

  return (
    <div>
      {summaryExist ? <Table
        columnDefinitions={summaryColumnDefinitions}
        onSelectionChange={({ detail }) =>
          console.log(detail)
        }
        items={summaryItems}
        wrapLines
        header={<Header>Post Call Summary</Header>}
        variant="embedded"
      /> : null}
      {summaryExist ? <Table
        columnDefinitions={actionColumnDefinitions}
        onSelectionChange={({ detail }) =>
          console.log(detail)
        }
        items={actionItems}
        wrapLines
        variant="embedded"
      /> : null}
      {notesExist ? <Table
        columnDefinitions={noteColumnDefinitions}
        onSelectionChange={({ detail }) =>
          console.log(detail)
        }
        items={noteItems}
        wrapLines
        variant="embedded"
      /> : null}

    </div>
  );
};

function App() {

  // INSTANTIATING STATE

  const [attributes, setAttributes] = useState(null);
  const [contactType, setContactType] = useState("");
  const [contactStateDuration, setContactStateDuration] = useState("");
  const [contactQueue, setContactQueue] = useState("");
  const [contactInitialContactId, setContactInitialContactId] = useState("")
  const [contactQueueTimestamp, setContactQueueTimestamp] = useState("");
  const [pollingIntervalId, setPollingIntervalId] = useState(null);
  const [lastContactId, setLastContactId] = useState(null);
  const [acw, setACW] = useState(false)
  const [messages, setMessages] = useState([]);
  const socketRef = useRef(null);
  const [searchSent, setSearchSent] = useState(false);
  const [qaHistory, setQaHistory] = useState([]);
  const [visibleCount, setVisibleCount] = useState(3);
  const [searchQuery, setSearchQuery] = useState("");
  const excludedAttributes = [];
  const toaster = useToaster();




  // INSTANTIATING AGENT/CONTACT CLIENTS
  const agentClient = new AgentClient();
  const contactClient = new ContactClient();

  // AGENT EVENT LISTENERS
  agentClient.onStateChanged(fetchAgentData);

  // CONTACT EVENT LISTENERS
  contactClient.onConnected(() => {
    fetchContactData();

    //startPollingAttributes(); // <-- start polling at the beginning of the call
  });
  contactClient.onMissed(fetchContactData);
  contactClient.onDestroyed(() => {
    contactId = null
    fetchContactData()
  });
  contactClient.onStartingAcw(doACW)


  /*
    async function pollAttributes() {
      if (!contactId) {
        console.warn("**** Polling skipped: no contact ID.");
        return;
      }
  
      try {
        const attributesList = await contactClient.getAttributes(contactId, '*');
        setAttributes(attributesList);
  
        const hasPCS = Object.hasOwn(attributesList, "PCS");
        console.log("**** hasPCS", hasPCS)
        if (hasPCS) {
          stopPollingAttributes();
        }
      } catch (err) {
        console.error("**** Polling error:", JSON.stringify(err, Object.getOwnPropertyNames(err)));
        stopPollingAttributes(); // Prevent continuous errors
      }
    }
  
  
    // Start polling after call is destroyed or ACW starts
    function startPollingAttributes() {
      console.log("**** Start polling")
      if (!pollingIntervalId) {
        const id = setInterval(pollAttributes, 3000); // Poll every 3 seconds
        setPollingIntervalId(id);
      }
    }
  
    // Stop polling when ACW ends or after a timeout
    function stopPollingAttributes() {
      console.log("**** Stop polling")
      if (pollingIntervalId) {
        clearInterval(pollingIntervalId);
        setPollingIntervalId(null);
      }
    }
  */

  async function doACW() {
    setACW(true)
    console.log("**** ACW")
  }

  // AGENT DATA HANDLER
  async function fetchAgentData(AgentStateChangedEventData) {
    /*
        //  GET AGENT ARN
        const arn = await agentClient.getARN();
        setAgentARN(arn); // SET STATE
    
        //  GET AGENT NAME
        const name = await agentClient.getName();
        setAgentName(name) // SET STATE
    
        // GET AGENT STATE
        const currentState = await agentClient.getState();
        setAgentState(currentState.state.name) // SET STATE
    
        // GET AGENT ROUTING PROFILE
        const routingProfile = await agentClient.getRoutingProfile();
        setAgentRoutingProfile(routingProfile.routingProfile.name);
    
        // GET AGENT CHANNEL CONCURRENCY
        const channelConcurrency = await agentClient.getChannelConcurrency();
        setAgentChannelConcurrency((prevState) => {
          return ({
            ...prevState,
            VOICE: `${channelConcurrency.channelConcurrency.VOICE}`
          });
        });
        setAgentChannelConcurrency((prevState) => {
          return ({
            ...prevState,
            CHAT: channelConcurrency.channelConcurrency.CHAT
          });
        });
        setAgentChannelConcurrency((prevState) => {
          return ({
            ...prevState,
            TASK: channelConcurrency.channelConcurrency.TASK
          });
        });
    
        // OTHER AGENT DATA
        //const extension = await agentClient.getExtension();
        //const dialableCountries = await agentClient.getDialableCountries();
        */

  }
  // CONTACT DATA HANDLER
  async function fetchContactData() {

    if (!contactId) {
      console.warn("**** No contactId in eventData, skipping.");
      return;
    }
    setLastContactId(contactId);

    try {
      const attributesList = await contactClient.getAttributes(contactId, '*');
      setAttributes(attributesList);
      console.log("**** ATTRIBUTES", attributesList);

      const initialContactId = await contactClient.getInitialContactId(contactId);
      setContactInitialContactId(initialContactId);
      console.log("**** ICI", initialContactId);
      wsConnect(initialContactId)
      const type = await contactClient.getType(contactId);
      setContactType(type);
      console.log("**** Type", type);

      const stateDuration = await contactClient.getStateDuration(contactId);
      setContactStateDuration(stateDuration);
      console.log("**** State Duration", stateDuration);

      const queue = await contactClient.getQueue(contactId);
      if (queue.queue.name == null) {
        setContactQueue(`Agent Queue ${queue.queue.queueARN}`);
      } else {
        setContactQueue(queue.queue.name);
      }

      const queueTimestamp = await contactClient.getQueueTimestamp(contactId);
      setContactQueueTimestamp(JSON.stringify(queueTimestamp));
      console.log("**** QUEUE TIMESTAMP", queueTimestamp);

    } catch (err) {
      console.error("**** Failed to fetch contact data:", JSON.stringify(err, Object.getOwnPropertyNames(err)));
    }
  }

  async function wsConnect(contactInitialContactId) {
    try {
      console.log("**** ID", contactInitialContactId)
      // Connect to WebSocket
      console.log(`**** WS Server: wss://${process.env.REACT_APP_LOAD_BALANCER}:${process.env.REACT_APP_PORT}`)
      const socket = new WebSocket(`wss://${process.env.REACT_APP_LOAD_BALANCER}:${process.env.REACT_APP_PORT}`);

      socketRef.current = socket;

      socket.onopen = () => {
        console.log("**** WebSocket connected", contactInitialContactId);
        socket.send(JSON.stringify({ contactId: contactInitialContactId }));
      };

      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        const attrs = message.attributes;
        console.log("****", message)
        const question = attrs?.AAQuestion;
        const answer = attrs?.AAText;
        const reference = attrs?.AALocation;

        setAttributes(attrs);
        setMessages((prev) => [...prev, message]);

        if (!question && !answer) return; // skip if neither exists

        setQaHistory((prev) => {
          const existingIndex = prev.findIndex(item => item.question === question);

          if (existingIndex !== -1) {
            const existingItem = prev[existingIndex];

            const updatedItem = {
              ...existingItem,
              answer: answer || existingItem.answer,
              reference: reference || existingItem.reference,
              // Preserve existing searchSent state if it exists, else fallback
              searchSent: existingItem.searchSent ?? (attrs?.QnA !== false)
            };

            const newList = prev.filter((_, i) => i !== existingIndex);

            return [updatedItem, ...newList];
          } else {
            const newItem = {
              question,
              answer: answer || "",
              reference: reference || "",
              searchSent: attrs?.QnA !== false
            };
            return [newItem, ...prev];
          }
        });
      };

      socket.onclose = (event) => {
        console.log("**** WebSocket closed:", event.code, event.reason, event.wasClean);
      };

      socket.onerror = (error) => {
        console.error("**** WebSocket error:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
      };

      return () => {
        socket.close();
      };
    } catch (err) {
      console.log("**** Err", err)
    }

  }

  const handleManualSearch = (searchQuery) => {

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        contactId,
        questionForKB: searchQuery
      }));
      setSearchQuery("");
      //const updated = [...qaHistory];
      //updated[index].searchSent = true;
      //setQaHistory(updated);
    } else {
      console.warn("WebSocket is not connected.");
    }
  };

  // OBTAIN CURRENT AGENT AND CURRENT CONTACT VALUES

  useEffect(() => {

  }, []);

  return (
    <Theme.Provider theme="twilio">
      <div className="App">
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '20px',
          backgroundColor: '#077398',
          zIndex: 1000 // Ensures it stays above other content
        }}>
          {/* Content goes here */}
        </div>
        <div style={{ marginTop: '20px', paddingBottom: '100px' }}>



          {!acw && attributes && <EATable
            qaHistory={qaHistory}
            setQaHistory={setQaHistory}
            visibleCount={visibleCount}
            setVisibleCount={setVisibleCount}
            socketRef={socketRef}
            attributes={attributes}
            toaster={toaster}
          />
          }
          {acw && attributes && <PCSTable attributes={attributes} />}
        </div>
        <br></br>
        {!acw && attributes && (
          <div>
            <div
              style={{
                position: 'fixed',
                bottom: '40px',
                left: 0,
                width: '100%',
                padding: '8px 16px',
                borderTop: '1px solid #ccc',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                zIndex: 1000,
                boxSizing: 'border-box',
                fontFamily: '"Open Sans", "Helvetica Neue", Roboto, Arial, sans-serif'
              }}
            >
              <label style={{ whiteSpace: 'nowrap', flex: 'none' }}>
                Search Knowledge Base:
              </label>
              <input
                type="text"
                placeholder="Enter your query..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleManualSearch(e.target.value);
                  }
                }}
                style={{
                  flexGrow: 1,
                  maxWidth: '70%',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  fontFamily: '"Open Sans", "Helvetica Neue", Roboto, Arial, sans-serif'
                }}
              />

              <Button
                variant="primary"
                onClick={() => handleManualSearch(searchQuery)}
              >
                Search
              </Button>
            </div>

            <div
              style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                width: '100%',
                height: '40px',
                backgroundColor: '#077398',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                fontFamily: '"Open Sans", "Helvetica Neue", Roboto, Arial, sans-serif'
              }}
            >
              <span>Agent Assist - Powered by Accenture</span>
            </div>
          </div>
        )}
        <Toaster left={['space180', 'unset', 'unset']} {...toaster} />
      </div>
    </Theme.Provider>

  );
}

export default App;