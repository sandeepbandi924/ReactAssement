import React, { useState, useEffect } from "react";
import { RotatingLines } from "react-loader-spinner";
import axios from "axios";
import ErrorView from "./components/ErrorView";
import ActionButtons from "./components/ActionButtons";
import "./App.css";

const API_URL = "https://apis.ccbp.in/list-creation/lists";

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [data, setData] = useState([]);
  const [lists, setLists] = useState({});
  const [listOrder, setListOrder] = useState([]);
  const [selectedLists, setSelectedLists] = useState([]);
  const [newListView, setNewListView] = useState(false);
  const [newListKey, setNewListKey] = useState(null);
  const [showCreateNewList, setShowCreateNewList] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await axios.get(API_URL);
      const { lists } = response.data;
      const groupedLists = lists.reduce((acc, item) => {
        if (!acc[item.list_number]) {
          acc[item.list_number] = [];
        }
        acc[item.list_number].push(item);
        return acc;
      }, {});

      const sortedListNumbers = Object.keys(groupedLists).sort((a, b) => a - b);
      setData(lists);
      setLists(groupedLists);
      setListOrder(sortedListNumbers);
      setLoading(false);
    } catch (err) {
      setError(true);
      setLoading(false);
    }
  };

  const handleListSelection = (listNumber) => {
    const updatedSelection = selectedLists.includes(listNumber)
      ? selectedLists.filter((num) => num !== listNumber)
      : [...selectedLists, listNumber];
    setSelectedLists(updatedSelection);
  };

  const handleCreateNewList = () => {
    if (selectedLists.length !== 2) {
      let alertForCheckEl = document.getElementById("alertForCheck");
      alertForCheckEl.textContent =
        "*You should select exactly 2 lists to create a new list";
      return;
    }

    setShowCreateNewList(false);
    const [firstList, secondList] = selectedLists.sort((a, b) => a - b);
    const nextListNumber = Math.max(...Object.keys(lists).map(Number)) + 1;
    const newListKey = nextListNumber.toString();
    setNewListKey(newListKey);

    setLists((prev) => {
      const updatedLists = { ...prev };
      const newOrder = [];

      let inserted = false;
      Object.keys(updatedLists)
        .sort((a, b) => a - b)
        .forEach((key) => {
          newOrder.push(key);
          if (key === firstList.toString() && !inserted) {
            newOrder.push(newListKey);
            inserted = true;
          }
        });

      const reorderedLists = {};
      newOrder.forEach((key) => {
        reorderedLists[key] = updatedLists[key] || [];
      });
      reorderedLists[newListKey] = [];

      return reorderedLists;
    });

    setListOrder((prevOrder) => {
      const newOrder = [...prevOrder];
      const insertIndex = newOrder.indexOf(firstList.toString()) + 1;
      newOrder.splice(insertIndex, 0, newListKey);
      return newOrder;
    });

    setNewListView(true);
  };

  const handleCancel = () => {
    setShowCreateNewList(true);
    setNewListView(false);
    setSelectedLists([]);
    fetchData();
  };

  const handleUpdate = () => {
    setShowCreateNewList(true);
    setNewListView(false);
    setSelectedLists([]);

    setLists((prevLists) => {
      const updatedLists = { ...prevLists };
      if (updatedLists["3"]) {
        updatedLists["3"] = [...updatedLists["3"]];
      }
      return updatedLists;
    });

    setListOrder((prevOrder) => {
      return [...prevOrder];
    });
  };

  return (
    <div className="App">
      {loading ? (
        <div className="loader">
          <RotatingLines
            strokeColor="grey"
            strokeWidth="5"
            animationDuration="0.75"
            width="96"
            visible={true}
          />
        </div>
      ) : error ? (
        <ErrorView onRetry={fetchData} />
      ) : (
        <div className="main-container">
          <div className="head-btn-container">
            {showCreateNewList && (
              <>
                <h1 className="main-heading">List Creation</h1>
                <button
                  type="button"
                  className="add-new-list-button"
                  onClick={handleCreateNewList}
                >
                  Create a New List
                </button>
              </>
            )}
            <span id="alertForCheck"></span>
          </div>

          <div className={`lists-container ${newListView ? "row" : ""}`}>
            {newListView ? (
              <div>
                <div className="list-creation-view">
                  {listOrder.map((listNumber) => (
                    <div key={listNumber} className="list-container">
                      <h3>
                        List {listNumber} ({lists[listNumber]?.length || 0}{" "}
                        items)
                      </h3>
                      <div className="list-item-container">
                        {lists[listNumber]?.map((item) => (
                          <div key={item.id} className="list-item">
                            <span className="name">{item.name}</span>
                            <span className="description">
                              {item.description}
                            </span>

                            {/* Arrow buttons for moving items */}
                            <div className="arrow-buttons">
                              {listNumber === "1" && (
                                <button
                                  className="arrow"
                                  onClick={() => handleMoveItem(item, "1", "3")}
                                >
                                  →
                                </button>
                              )}
                              {listNumber === "2" && (
                                <button
                                  className="arrow"
                                  onClick={() => handleMoveItem(item, "2", "3")}
                                >
                                  ←
                                </button>
                              )}
                              {listNumber === "3" && (
                                <div className="arrow-buttons-row">
                                  <button
                                    className="arrow start-arrow"
                                    onClick={() =>
                                      handleMoveItem(item, "3", "1")
                                    }
                                  >
                                    ←
                                  </button>
                                  <button
                                    className="arrow end-arrow"
                                    onClick={() =>
                                      handleMoveItem(item, "3", "2")
                                    }
                                  >
                                    →
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <ActionButtons
                  onCancel={handleCancel}
                  onUpdate={handleUpdate}
                />
              </div>
            ) : (
              <>
                <div className="list-selection">
                  {listOrder.map((listNumber) => (
                    <div key={listNumber} className="list-container">
                      <div className="check-heading">
                        <input
                          id={`myCheckbox + ${listNumber}`}
                          type="checkbox"
                          checked={selectedLists.includes(listNumber)}
                          onChange={() => handleListSelection(listNumber)}
                        />
                        <label
                          htmlFor={`myCheckbox + ${listNumber}`}
                          className="list-head"
                        >
                          List {listNumber}
                        </label>
                      </div>
                      {lists[listNumber].map((item) => (
                        <div className="list-item" key={item.id}>
                          <span className="name">{item.name}</span>
                          <span className="description">
                            {item.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
