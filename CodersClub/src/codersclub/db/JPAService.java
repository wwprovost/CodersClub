/*
Copyright 2010-2014 Will Provost.
All rights reserved by Capstone Courseware, LLC.
*/

package codersclub.db;

import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;
import javax.persistence.PersistenceException;

/**
A generic service that offers CRUD operations, suitable for EJB, Spring, 
and other transaction-managed contexts.

@author Will Provost
*/
public class JPAService<T>
    implements CRUDService<T>
{
    protected EntityManagerFactory emf;
    
    protected Class<T> cls;
    private String getAllQuery;
    private String getCountQuery;
    private String orderingClause = "";

    public JPAService (Class<T> cls)
    {
        this (Persistence.createEntityManagerFactory ("Billing_EE"), cls);
    }
    
    public JPAService (EntityManagerFactory emf, Class<T> cls, String... orderBys)
    {
        this.emf = emf;
        this.cls = cls;

        String pkgName = cls.getPackage ().getName ();
        String clsName = cls.getName ().substring (pkgName.length () + 1);
        getAllQuery = "select x from " + clsName + " x";
        getCountQuery = "select count(x) from " + clsName + " x";
        
        if (orderBys.length != 0)
        {
            StringBuilder clause = new StringBuilder (" order by");
            for (String field : orderBys)
                clause.append (" x.").append (field).append (", ");
            
            orderingClause = 
                clause.delete (clause.length () - 2, clause.length ())
                    .toString ();
        }
    }
    
    /**
    Helper to bail out of certain operations if the object doesn't exist. 
    */
    private T findObjectOrFail 
        (T object, EntityManager em, String message)
    {
        Object ID = emf.getPersistenceUnitUtil ().getIdentifier (object);
        T result = em.find (cls, ID);
        if (result == null)
        {
            em.getTransaction ().rollback ();
            throw new IllegalArgumentException (message);
        }
        
        return result;
    }
    
    /**
    Returns the total number of objects.
    */
    public long getCount ()
    {
        EntityManager em = emf.createEntityManager ();
        long result = -1;
        try
        {
            result = em.createQuery (getCountQuery, Long.class)
                .getSingleResult ();
        }
        catch (PersistenceException ex)
        {
            ex.printStackTrace ();
        }
        finally
        {
            em.close ();
        }
        
        return result;
    }

    /**
    Returns a list of all entities of our managed type.
    */
    @SuppressWarnings("unchecked")
    public List<T> getAll ()
    {
        EntityManager em = emf.createEntityManager ();
        List<T> result = null;
        try
        {
            result = em.createQuery (getAllQuery + orderingClause)
                .getResultList ();
        }
        catch (PersistenceException ex)
        {
            ex.printStackTrace ();
        }
        finally
        {
            em.close ();
        }
        
        return result;
    }

    /**
    Returns the entity with the given ID, or null if not found.
    */
    public T getByID (int ID)
    {
        EntityManager em = emf.createEntityManager ();
        T result = null;
        try
        {
            result = em.find (cls, ID);
        }
        catch (PersistenceException ex)
        {
            ex.printStackTrace ();
        }
        finally
        {
            em.close ();
        }
        
        return result;
    }

    /**
    Returns the entity with the given value for the given named field.
    */
    public T getByKey (String name, Object value)
    {
        EntityManager em = emf.createEntityManager ();
        T result = null;
        try
        {
            result = em.createQuery 
                    (getAllQuery + " where x." + name + "=:value", cls)
                .setParameter ("value", value)
                .getSingleResult ();
        }
        catch (PersistenceException ex)
        {
            ex.printStackTrace ();
        }
        finally
        {
            em.close ();
        }
        
        return result;
    }

    /**
    Returns the entity with the given value for the given named field.
    */
    public List<T> getAllByFilter (String name, Object value)
    {
        EntityManager em = emf.createEntityManager ();
        List<T> result = null;
        try
        {
            result = em.createQuery 
                    (getAllQuery + " where x." + name + "=:value" + 
                        orderingClause, cls)
                .setParameter ("value", value)
                .getResultList ();
        }
        catch (PersistenceException ex)
        {
            ex.printStackTrace ();
        }
        finally
        {
            em.close ();
        }
        
        return result;
    }

    /**
    Adds the given object to the database.
    */
    public T add (T newObject)
    {
        EntityManager em = emf.createEntityManager ();
        try
        {
            em.getTransaction ().begin ();
            em.persist (newObject);
            em.getTransaction ().commit ();
        }
        catch (PersistenceException ex)
        {
            ex.printStackTrace ();
            em.getTransaction ().rollback ();
        }
        finally
        {
            em.close ();
        }
        
        return newObject;
    }

    /**
    Merges the given object into the database.
    */
    public T update (T modifiedObject)
    {
        EntityManager em = emf.createEntityManager ();
        T result = null;
        try
        {
            em.getTransaction ().begin ();
            findObjectOrFail (modifiedObject, em,
                "No such object; call add() to insert a new object.");
            result = em.merge (modifiedObject);
            em.getTransaction ().commit ();
        }
        catch (PersistenceException ex)
        {
            ex.printStackTrace ();
            em.getTransaction ().rollback ();
        }
        finally
        {
            em.close ();
        }
        
        return result;
    }

    /**
    Removes the given object from the database.
    */
    public void remove (T oldObject)
    {
        EntityManager em = emf.createEntityManager ();
        try
        {
            em.getTransaction ().begin ();
            T doomed = findObjectOrFail 
                (oldObject, em, "No object with this ID.");
            em.remove (doomed);
            em.getTransaction ().commit ();
        }
        catch (PersistenceException ex)
        {
            ex.printStackTrace ();
            em.getTransaction ().rollback ();
        }
        finally
        {
            em.close ();
        }
    }

    /**
    Removes the object with the given ID from the database.
    */
    public void removeByID (int ID)
    {
        EntityManager em = emf.createEntityManager ();
        try
        {
            em.getTransaction ().begin ();
            T oldObject = em.find (cls, ID);
            if (oldObject == null)
            {
                em.getTransaction ().rollback ();
                throw new IllegalArgumentException 
                    ("No object with ID: " + ID);
            }
            
            em.remove (oldObject);
            em.getTransaction ().commit ();
        }
        catch (PersistenceException ex)
        {
            ex.printStackTrace ();
            em.getTransaction ().rollback ();
        }
        finally
        {
            em.close ();
        }
    }

    /**
    Accessor for our managed class.
    */
    public Class<T> getEntityClass ()
    {
        return cls;
    }
}

