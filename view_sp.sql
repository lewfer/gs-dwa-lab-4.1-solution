use myforum;

DROP VIEW IF EXISTS vw_posts;

CREATE VIEW vw_posts AS
	SELECT post_id, p.post_date, t.topic_title, u.username, p.post_title, p.post_content, t.topic_id, u.user_id
	FROM   posts p
	JOIN   topics t
	ON     t.topic_id=p.topic_id
	JOIN   users u
	ON     u.user_id=p.user_id
	ORDER BY post_date;

DROP VIEW IF EXISTS vw_membership;
CREATE VIEW vw_membership AS
	SELECT m.topic_id, m.user_id, t.topic_title, t.topic_description, u.username, u.firstname, u.surname, u.country
	FROM   membership m
	JOIN   topics t
	ON     t.topic_id=m.topic_id
	JOIN   users u
	ON     u.user_id=m.user_id;

DROP PROCEDURE IF EXISTS sp_insert_post;

DELIMITER //
CREATE PROCEDURE sp_insert_post(IN p_post_title VARCHAR(30), IN p_post_content MEDIUMTEXT, IN p_topic_title VARCHAR(20), IN p_username VARCHAR(15))
BEGIN
	DECLARE v_user_id INT;
    DECLARE v_topic_id INT;
    DECLARE v_user_is_member INT;
    
	SELECT user_id 
    FROM   users 
    WHERE  username = p_username 
    INTO   v_user_id;
    
    IF ISNULL(v_user_id) THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No matching username found';
	END IF;
    
	SELECT topic_id 
    FROM   topics 
    WHERE  topic_title = p_topic_title 
    INTO   v_topic_id;
    
    IF ISNULL(v_topic_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No matching topic found';
	END IF;    
    
    SELECT COUNT(*) AS countmembership 
    FROM               membership 
    WHERE              user_id=v_user_id AND topic_id=v_topic_id
    INTO               v_user_is_member;
    
	IF v_user_is_member=0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User is not a member of that topic';
	END IF;    
    
	INSERT INTO posts (post_date, post_title, post_content, user_id, topic_id)
	VALUES (now(), p_post_title, p_post_content, v_user_id, v_topic_id);
END //
DELIMITER ;

#CALL sp_insert_post("sp1","sp2","food","barnie");
#CALL sp_insert_post("sp1","sp2","fool","roly");
#CALL sp_insert_post("sp1","sp2","food","roly");

#SELECT * FROM posts;

