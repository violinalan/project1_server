const Pool = require("pg").Pool;
const pool = new Pool({
  user: "admin",
  host: "db",
  database: "mx_schedule",
  password: "admin",
  port: 5432,
});

const getTickets = (request, response) => {
  pool.query(
    "SELECT  \
      ticket_id AS id,  \
      au1.username AS created_by,  \
      start_timestamp AS start,  \
      suspense_timestamp AS suspense,  \
      close_timestamp AS closed,  \
      au2.username AS closed_by,  \
      is_scheduled,  \
      component_name,  \
      aircraft_model,  \
      tail_number,  \
      work_center_location AS Location,  \
      narrative AS description  \
    FROM ticket t  \
    JOIN work_center wc USING(work_center_id)  \
    JOIN app_user au1 ON t.created_by_user_id = au1.user_id  \
    JOIN component c USING(component_id)  \
    JOIN aircraft a ON c.aircraft_id = a.aircraft_id  \
    LEFT JOIN app_user au2 ON t.closed_by_user_id = au2.user_id  \
    ORDER BY id", 
      (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const deleteTicket = (request, response) => {
  const id = parseInt(request.params.id);
  pool.query("DELETE FROM ticket WHERE ticket_id = $1", [id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  })
}

const createRecurringTicket = (request, response) => {
  const { aircraft_id, component_name, suspense, description } = request.body

  pool.query(
    "INSERT INTO ticket  \
      (Created_By_User_ID,  \
      Work_Center_ID,  \
      Component_ID,  \
      Start_Timestamp,  \
      Suspense_Timestamp,  \
      Close_Timestamp,  \
      Is_Scheduled,  \
      Narrative,  \
      Closed_By_User_ID)  \
    VALUES  \
      (12,  \
      (SELECT work_center_id from aircraft WHERE aircraft_id=$1), \
      (SELECT component_id FROM component WHERE aircraft_id=$1 AND component_name=$2), \
      '2020-11-22 15:30:00', \
      $3, \
      null, \
      'true', \
      $4, \
      null)",
      [parseInt(aircraft_id), component_name, suspense, description], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(201).send(`Ticket created.`)
  })
}

const editTicket = (request, response) => {
  const { aircraft_id, component_name, suspense, description } = request.body;
  const id = parseInt(request.params.id);
  var flag = false;

  if(aircraft_id) {
    pool.query(
      "UPDATE ticket  \
      SET  \
        work_center_id = (SELECT work_center_id from aircraft WHERE aircraft_id=$1),  \
        component_id = (SELECT component_id FROM component WHERE aircraft_id=$1 AND component_name=$2)  \
      WHERE ticket_id=$3",
      [aircraft_id, component_name, id], (error, results) => {
      if (error) {
        throw error;
      }
      if(!flag) {
        response.status(200).json(results.rows);
        flag = true;
      }
    })
  }

  if(suspense) {
    pool.query(
      "UPDATE ticket  \
      SET  \
        Suspense_Timestamp=$1,  \
        Is_Scheduled='true'  \
      WHERE ticket_id=$2",
      [suspense, id], (error, results) => {
      if (error) {
        throw error;
      }
      if(!flag) {
        response.status(200).json(results.rows);
        flag = true;
      }
    })
  }

  if(description) {
    pool.query(
      "UPDATE ticket  \
      SET  \
        Narrative=$1  \
      WHERE ticket_id=$2",
      [description, id], (error, results) => {
      if (error) {
        throw error;
      }
      if(!flag) {
        response.status(200).json(results.rows);
        flag = true;
      }
    })
  }
}

const getTailNumbers = (request, response) => {
  pool.query("SELECT * FROM aircraft ORDER BY aircraft_id", (error, results) => {
    if(error) {
      throw error;
    }
    response.status(200).json(results.rows);
  })
}

const getComponents = (request, response) => {
  pool.query("SELECT DISTINCT component_name FROM component ORDER BY component_name", (error, results) => {
    if(error) {
      throw error;
    }
    response.status(200).json(results.rows);
  })
}

module.exports = {
  getTickets,
  deleteTicket,
  createRecurringTicket,
  editTicket,
  getTailNumbers,
  getComponents,
};
