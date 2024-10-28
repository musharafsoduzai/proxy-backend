import { client } from "../config/db.js";
import { insert, update } from "../config/dynamicQuery.js";
import moment from "moment";
const promise = client.promise();
const BaseUrl = process.env.BASE_URL;

export default {

  addRole: async (req, res) => {
    try {
      const result = await insert(req.body);
        const insertQuery = `INSERT INTO role (${result.keys}) VALUES (${result.placeholders})`;
        const [insertRes] = await promise.query(
          insertQuery,
          result.finalInsertValues,
        );
        if (insertRes.affectedRows > 0) {
          return res
            .status(201)
            .send({ message: "record inserted", success: true });
        } else {
          return res
            .status(409)
            .send({ message: "error occured", success: false });
        }
      
    } catch (error) {
      console.log(`Error in addFleet : ${error}`);
      return res.status(500).send({ message: error?.message, success: false });
    }
  },

  getOneRole: async (req, res) => {
    try {
      const query = `SELECT * FROM role WHERE id = ?`;
      const [role] = await promise.query(query, [req.params.id]);
      if (!role[0]) {
        return res
          .status(404)
          .send({ message: "no record found", success: false, data: [] });
      } else {
        return res.status(200).send({
          message: "record fetched",
          success: true,
          data: role[0],
        });
      }
    } catch (error) {
      console.log(`Error : ${error}`);
      return res.status(500).send({ message: error?.message, success: false });
    }
  },

  getAllRoles: async (req, res) => {
    try {
      const query = `SELECT * FROM role ORDER BY createdAt DESC`;
      const [roleRes] = await promise.query(query, [0]);
      if (!roleRes[0]) {
        return res
          .status(409)
          .send({ message: "no record found", success: false, data: [] });
      } else {
        return res
          .status(200)
          .send({ message: "record fetched", success: true, data: roleRes });
      }
    } catch (error) {
      console.log(`Error : ${error}`);
      return res.status(500).send({ message: error?.message, success: false });
    }
  },

  updateRole: async (req, res) => {
    try {
        const result = await update(req.body, req.params.id);
        const updateQuery = `UPDATE role SET ${result.setClause} WHERE id = ?`;
        const [updateRes] = await promise.query(
          updateQuery,
          result.queryParams,
        );
        if (updateRes.affectedRows > 0) {
          return res
            .status(201)
            .send({ message: "Record updated", success: true });
        } else {
          return res
            .status(404)
            .send({ message: "record not found", success: false });
        }
  
    } catch (error) {
      console.log(`Error in updateFleet : ${error}`);
      return res.status(500).send({ message: error?.message, success: false });
    }
  },

  deleteRole: async (req, res) => {
    try {
        const { id } = req.params;
        const deleteQuery = "DELETE FROM role WHERE id = ?";
        const [deleteRes] = await promise.query(deleteQuery, [id]);
    
        if (deleteRes.affectedRows > 0) {
          return res
            .status(200)
            .send({ message: "Record deleted successfully", success: true });
        } else {
          return res
            .status(404)
            .send({ message: "Record not found", success: false });
        }
      } catch (error) {
        console.error(`Error in deleteRole: ${error}`);
        return res.status(500).send({ message: error.message, success: false });
      }
  },
};
